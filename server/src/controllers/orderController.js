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
// 1. CUSTOMER: CREATE A NEW ORDER (FINAL FORM)
// ==========================================
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
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

    // Filter to only checkout selected items
    const selectedItems = cart.CartItems.filter((item) =>
      cartItemIds.includes(item.id),
    );

    if (selectedItems.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Selected items not found in cart" });
    }

    let subtotal = 0;

    // Validate stock first
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

    // Create the Parent Order
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

    // 🔥 THE COMMISSION ENGINE & LOYALTY POINTS
    let totalLoyaltyPointsEarned = 0;

    for (const item of selectedItems) {
      const book = item.Book;

      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);

      const itemTotal = effectivePrice * item.quantity;

      // Dynamic Commission logic (Admin gets X%, Seller gets the rest)
      const seller = await User.findByPk(book.sellerId, { transaction });
      const commissionRate = seller ? seller.commissionRate : 10.0;

      const commissionCut = itemTotal * (commissionRate / 100);
      const sellerEarnings = itemTotal - commissionCut;

      await OrderItem.create(
        {
          orderId: order.id,
          bookId: book.id,
          sellerId: book.sellerId, // Exact routing for the seller dashboard
          quantity: item.quantity,
          priceAtPurchase: effectivePrice,
          commissionCut,
          sellerEarnings,
          itemStatus: "Pending",
        },
        { transaction },
      );

      // Deduct stock
      book.stock -= item.quantity;
      await book.save({ transaction });

      // Calculate points (1 point per Rs. 100 spent)
      totalLoyaltyPointsEarned += Math.floor(itemTotal / 100);
    }

    // Award loyalty points to the customer!
    const customer = await User.findByPk(userId, { transaction });
    if (customer) {
      customer.loyaltyPoints =
        (customer.loyaltyPoints || 0) + totalLoyaltyPointsEarned;
      await customer.save({ transaction });
    }

    // Delete ONLY checked-out items from cart
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
// 4. ADMIN: UPDATE ORDER STATUS & PAYOUT SELLERS
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

    // 🔥 THE PAYOUT LEDGER: If order becomes "Delivered", add money to seller wallets!
    if (orderStatus === "Delivered" && order.orderStatus !== "Delivered") {
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
      });

      for (const item of orderItems) {
        const seller = await User.findByPk(item.sellerId);
        if (seller) {
          seller.walletBalance =
            Number(seller.walletBalance) + Number(item.sellerEarnings);
          await seller.save();
        }
        item.itemStatus = "Delivered"; // Mark individual item as delivered
        await item.save();
      }

      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    order.orderStatus = orderStatus;
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
// 6. ADMIN: GET DASHBOARD STATS
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin only." });
    }

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

    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesData.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
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
      salesData,
      orderStatusData,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

// ==========================================
// 7. ADMIN & SELLER: TOGGLE PACKED STATUS
// ==========================================
export const toggleItemPackedStatus = async (req, res) => {
  try {
    // Both Admin and Sellers can pack items!
    if (req.user.role !== "admin" && req.user.role !== "seller") {
      return res.status(403).json({ message: "Not authorized." });
    }

    const { orderId, itemId } = req.params;
    const { isPacked } = req.body;

    const orderItem = await OrderItem.findOne({
      where: { id: itemId, orderId: orderId },
    });

    if (!orderItem) return res.status(404).json({ message: "Item not found" });

    // Security Check: If it's a seller, they can ONLY pack their own items
    if (req.user.role === "seller" && orderItem.sellerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only pack your own items." });
    }

    orderItem.isPacked = isPacked;
    if (isPacked) orderItem.itemStatus = "Packed";

    await orderItem.save();

    res.status(200).json({ message: "Item packing status updated" });
  } catch (error) {
    console.error("Toggle Pack Error:", error);
    res.status(500).json({ message: "Server error updating packing status" });
  }
};

// ==========================================
// 8. SELLER: GET THEIR SPECIFIC STORE ORDERS
// ==========================================
export const getSellerOrders = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Not authorized. Sellers only." });
    }

    // Only fetch OrderItems that belong to THIS seller, but include Parent Order for Customer Details
    const sellerItems = await OrderItem.findAll({
      where: { sellerId: req.user.id },
      include: [
        { model: Book, attributes: ["title", "image", "price"] },
        {
          model: Order,
          attributes: [
            "id",
            "orderStatus",
            "paymentStatus",
            "fullName",
            "address",
            "city",
            "phone",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(sellerItems);
  } catch (error) {
    console.error("Seller Orders Error:", error);
    res.status(500).json({ message: "Server error fetching seller orders" });
  }
};
// ==========================================
// 9. SELLER: GET WALLET & EARNINGS STATS
// ==========================================
export const getSellerWalletStats = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Not authorized. Sellers only." });
    }

    const sellerId = req.user.id;

    // Fetch the seller to get their current actual wallet balance
    const seller = await User.findByPk(sellerId);

    // Get all items sold by this seller
    const allItems = await OrderItem.findAll({
      where: { sellerId },
    });

    // Calculate Lifetime Earnings (Only from Delivered Items)
    const lifetimeEarnings = allItems
      .filter((item) => item.itemStatus === "Delivered")
      .reduce((sum, item) => sum + Number(item.sellerEarnings), 0);

    // Calculate Platform Fees Paid (Only from Delivered Items)
    const lifetimeCommission = allItems
      .filter((item) => item.itemStatus === "Delivered")
      .reduce((sum, item) => sum + Number(item.commissionCut), 0);

    // Calculate Pending Value (Orders placed but not yet delivered)
    const pendingValue = allItems
      .filter((item) => item.itemStatus !== "Delivered")
      .reduce((sum, item) => sum + Number(item.sellerEarnings), 0);

    res.status(200).json({
      currentBalance: Number(seller.walletBalance) || 0,
      lifetimeEarnings,
      lifetimeCommission,
      pendingValue,
      commissionRate: seller.commissionRate,
    });
  } catch (error) {
    console.error("Wallet Stats Error:", error);
    res.status(500).json({ message: "Server error fetching wallet stats" });
  }
};
