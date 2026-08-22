import {
  Cart,
  CartItem,
  Book,
  Order,
  OrderItem,
  User,
} from "../models/index.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";

// ==========================================
// 1. CUSTOMER: CREATE A NEW ORDER
// ==========================================
// ==========================================
// 1. CUSTOMER: CREATE A NEW ORDER
// ==========================================
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    // We now expect an array of specific cart IDs from the frontend!
    const { fullName, phone, address, city, paymentMethod, cartItemIds } =
      req.body;

    if (!cartItemIds || cartItemIds.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "No items selected for checkout" });
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, include: [Book] }],
      transaction,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 🔥 FILTER THE CART: Only checkout the items the user checked the box for!
    const selectedItems = cart.CartItems.filter((item) =>
      cartItemIds.includes(item.id),
    );

    if (selectedItems.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Selected items not found in cart" });
    }

    // Validate stock and calculate totals securely
    let subtotal = 0;
    for (const item of selectedItems) {
      const book = item.Book;
      if (book.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}". Only ${book.stock} left.`,
        });
      }

      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);

      subtotal += effectivePrice * item.quantity;
    }

    const deliveryFee = subtotal >= 1000 ? 0 : 100;
    const grandTotal = subtotal + deliveryFee;

    const order = await Order.create(
      {
        userId,
        totalAmount: subtotal,
        deliveryFee,
        grandTotal,
        fullName,
        phone,
        address,
        city,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        orderStatus: "Processing",
      },
      { transaction },
    );

    for (const item of selectedItems) {
      const book = item.Book;
      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);

      await OrderItem.create(
        {
          orderId: order.id,
          bookId: book.id,
          quantity: item.quantity,
          priceAtPurchase: effectivePrice,
        },
        { transaction },
      );

      book.stock -= item.quantity;
      await book.save({ transaction });
    }

    // 🔥 ONLY DELETE THE SELECTED ITEMS from the cart, leaving unselected items for later!
    await CartItem.destroy({
      where: { id: { [Op.in]: cartItemIds } },
      transaction,
    });

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Order placed successfully!", orderId: order.id });
  } catch (error) {
    await transaction.rollback();
    console.error("Checkout Error:", error);
    res.status(500).json({ message: "Server error during checkout" });
  }
};

// ==========================================
// 2. CUSTOMER: GET THEIR OWN ORDER HISTORY
// ==========================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Book],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// ==========================================
// 3. ADMIN: GET ALL ORDERS FROM EVERYONE
// ==========================================
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: OrderItem, include: [Book] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Admin Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error fetching all orders" });
  }
};

// ==========================================
// 4. ADMIN: UPDATE ORDER STATUS (Shipped, etc)
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;

    // Smart logic: If it's COD and marked Delivered, they paid the cash!
    if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully!", order });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error updating order status" });
  }
};

// ==========================================
// 5. ADMIN: GET SINGLE ORDER DETAILS
// ==========================================
export const getOrderDetails = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: OrderItem, include: [Book] },
      ],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    console.error("Fetch Order Details Error:", error);
    res.status(500).json({ message: "Server error fetching order details" });
  }
};

// ==========================================
// 6. ADMIN: GET DASHBOARD STATS (UPGRADED WITH CHARTS)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    // 1. Basic Stats
    const totalBooks = await Book.count();
    const lowStockBooks = await Book.count({
      where: { stock: { [Op.lt]: 10 } },
    });
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({
      where: { orderStatus: "Processing" },
    });
    const revenue = await Order.sum("grandTotal", {
      where: { paymentStatus: "Paid" },
    });

    // 2. Chart 1: Revenue over the last 7 days
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesData.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }), // e.g., Mon, Tue
        dateString: d.toDateString(),
        revenue: 0,
        orders: 0,
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
    });

    recentOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toDateString();
      const dayData = salesData.find((d) => d.dateString === orderDate);
      if (dayData) {
        dayData.orders += 1;
        if (order.paymentStatus === "Paid") {
          dayData.revenue += Number(order.grandTotal);
        }
      }
    });

    // 3. Chart 2: Order Status Distribution (Pie Chart)
    const statusDistribution = await Order.findAll({
      attributes: [
        "orderStatus",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["orderStatus"],
    });

    const orderStatusData = statusDistribution.map((s) => ({
      name: s.orderStatus,
      value: Number(s.get("count")),
    }));

    res.status(200).json({
      totalBooks,
      lowStockBooks,
      totalOrders,
      pendingOrders,
      totalRevenue: revenue || 0,
      salesData, // <-- NEW: Array of 7 days of revenue
      orderStatusData, // <-- NEW: Array of order statuses
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};
// ==========================================
// 7. ADMIN: TOGGLE PACKED STATUS FOR AN ITEM
// ==========================================
export const toggleItemPackedStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

    const { orderId, itemId } = req.params;
    const { isPacked } = req.body;

    const orderItem = await OrderItem.findOne({
      where: { id: itemId, orderId: orderId },
    });

    if (!orderItem) return res.status(404).json({ message: "Item not found" });

    orderItem.isPacked = isPacked;
    await orderItem.save();

    res.status(200).json({ message: "Item packing status updated" });
  } catch (error) {
    console.error("Toggle Pack Error:", error);
    res.status(500).json({ message: "Server error updating packing status" });
  }
};
