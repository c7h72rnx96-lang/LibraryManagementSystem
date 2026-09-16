// === src/controllers/orderController.js ===
import { OrderService } from "../services/OrderService.js";
import {
  Order,
  OrderItem,
  User,
  Book,
  Coupon,
  Payout,
  Genre,
} from "../models/index.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
import PDFDocument from "pdfkit";

// ==========================================
// 1. REFACTORED ROUTES (Using Services)
// ==========================================
export const createOrder = async (req, res, next) => {
  try {
    const result = await OrderService.checkout(req.user.id, req.body);
    res.status(201).json({
      message: "Order placed successfully!",
      orderId: result.orderId,
      pointsEarned: result.pointsEarned,
      loyaltyDiscount: result.loyaltyDiscount,
      couponDiscount: result.couponDiscount,
    });
  } catch (error) {
    next(error); // Caught natively by errorHandler middleware
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized. Admin only." });

    const order = await OrderService.updateOrderStatus(
      req.params.id,
      req.body.orderStatus,
    );
    res
      .status(200)
      .json({ message: "Order status updated successfully!", order });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. EXISTING ROUTES (Left intact)
// ==========================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, include: [Book] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized. Admin only." });
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: OrderItem, include: [Book] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching all orders" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized. Admin only." });
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: OrderItem, include: [Book] },
      ],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching order details" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized. Admin only." });

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
        if (order.paymentStatus === "Paid")
          dayData.revenue += Number(order.grandTotal);
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
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

export const toggleItemPackedStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "seller")
      return res.status(403).json({ message: "Not authorized." });

    const { orderId, itemId } = req.params;
    const { isPacked } = req.body;

    const orderItem = await OrderItem.findOne({
      where: { id: itemId, orderId: orderId },
    });
    if (!orderItem) return res.status(404).json({ message: "Item not found" });

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
    res.status(500).json({ message: "Server error updating packing status" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    if (req.user.role !== "seller")
      return res.status(403).json({ message: "Not authorized. Sellers only." });

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
    res.status(500).json({ message: "Server error fetching seller orders" });
  }
};

export const getSellerWalletStats = async (req, res) => {
  try {
    if (req.user.role !== "seller")
      return res.status(403).json({ message: "Not authorized. Sellers only." });

    const sellerId = req.user.id;
    const seller = await User.findByPk(sellerId);
    const allItems = await OrderItem.findAll({ where: { sellerId } });

    const lifetimeEarnings = allItems
      .filter((item) => item.itemStatus === "Delivered")
      .reduce((sum, item) => sum + Number(item.sellerEarnings), 0);
    const lifetimeCommission = allItems
      .filter((item) => item.itemStatus === "Delivered")
      .reduce((sum, item) => sum + Number(item.commissionCut), 0);
    const pendingValue = allItems
      .filter((item) => item.itemStatus !== "Delivered")
      .reduce((sum, item) => sum + Number(item.sellerEarnings), 0);
    const payouts = await Payout.findAll({
      where: { sellerId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      currentBalance: Number(seller.walletBalance) || 0,
      lifetimeEarnings,
      lifetimeCommission,
      pendingValue,
      commissionRate: seller.commissionRate,
      payoutHistory: payouts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching wallet stats" });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: OrderItem, include: [Book] },
      ],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isCustomer = req.user.id === order.userId;
    const isAdmin = req.user.role === "admin";
    const isSellerForOrder = order.OrderItems.some(
      (item) => item.sellerId === req.user.id,
    );

    if (!isAdmin && !isCustomer && !isSellerForOrder) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this invoice." });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${order.id}.pdf`,
    );
    doc.pipe(res);

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("LibraryMS", { align: "left" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Official Marketplace Receipt", { align: "left" });
    doc.moveDown(2);

    doc.fontSize(12).font("Helvetica-Bold").text("INVOICE DETAILS");
    doc.font("Helvetica").text(`Order ID: #${order.id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Status: ${order.paymentStatus}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("BILLED TO");
    doc.font("Helvetica").text(order.fullName);
    doc.text(`${order.address}, ${order.city}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Email: ${order.User?.email}`);
    doc.moveDown(2);

    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Item Title", 50, tableTop);
    doc.text("Qty", 350, tableTop, { width: 50, align: "center" });
    doc.text("Unit Price", 400, tableTop, { width: 70, align: "right" });
    doc.text("Total", 470, tableTop, { width: 70, align: "right" });
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(540, tableTop + 15)
      .stroke();

    let position = tableTop + 25;
    doc.font("Helvetica");
    order.OrderItems.forEach((item) => {
      const lineTotal = Number(item.priceAtPurchase) * item.quantity;
      doc.text(item.Book?.title || "Unknown Book", 50, position, {
        width: 290,
      });
      doc.text(item.quantity.toString(), 350, position, {
        width: 50,
        align: "center",
      });
      doc.text(
        `Rs. ${Number(item.priceAtPurchase).toFixed(2)}`,
        400,
        position,
        { width: 70, align: "right" },
      );
      doc.text(`Rs. ${lineTotal.toFixed(2)}`, 470, position, {
        width: 70,
        align: "right",
      });
      position += 20;
    });

    doc
      .moveTo(50, position + 10)
      .lineTo(540, position + 10)
      .stroke();
    position += 25;

    const subtotal = Number(order.totalAmount);
    const deliveryFee = Number(order.deliveryFee);
    const grandTotal = Number(order.grandTotal);
    const totalDiscount = subtotal + deliveryFee - grandTotal;

    doc.font("Helvetica-Bold").fillColor("black");
    doc.text("Subtotal:", 350, position, { width: 120, align: "right" });
    doc.font("Helvetica").text(`Rs. ${subtotal.toFixed(2)}`, 470, position, {
      width: 70,
      align: "right",
    });
    position += 20;

    doc.font("Helvetica-Bold");
    doc.text("Delivery Fee:", 350, position, { width: 120, align: "right" });
    doc.font("Helvetica").text(`Rs. ${deliveryFee.toFixed(2)}`, 470, position, {
      width: 70,
      align: "right",
    });
    position += 20;

    if (totalDiscount > 0) {
      doc.font("Helvetica-Bold").fillColor("red");
      doc.text("Discounts Applied:", 350, position, {
        width: 120,
        align: "right",
      });
      doc
        .font("Helvetica")
        .text(`- Rs. ${totalDiscount.toFixed(2)}`, 470, position, {
          width: 70,
          align: "right",
        });
      position += 20;
    }

    doc.font("Helvetica-Bold").fillColor("black");
    doc.text("Grand Total:", 350, position, { width: 120, align: "right" });
    doc.fillColor("green").text(`Rs. ${grandTotal.toFixed(2)}`, 470, position, {
      width: 70,
      align: "right",
    });

    doc.moveDown(4);
    doc
      .fillColor("black")
      .font("Helvetica-Oblique")
      .fontSize(10)
      .text("Thank you for shopping with LibraryMS!", { align: "center" });
    doc.end();
  } catch (error) {
    if (!res.headersSent)
      res.status(500).json({ message: "Failed to generate invoice" });
  }
};

export const getCustomerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    const orderItems = await OrderItem.findAll({
      include: [
        { model: Order, where: { userId }, attributes: [] },
        { model: Book, include: [{ model: Genre }] },
      ],
    });

    const genreCounts = {};
    const purchasedBooks = [];
    let totalBooksRead = 0;

    orderItems.forEach((item) => {
      if (item.Book) {
        totalBooksRead += item.quantity;
        const genreName = item.Book.Genre?.name || "Uncategorized";
        genreCounts[genreName] = (genreCounts[genreName] || 0) + item.quantity;
        if (!purchasedBooks.find((b) => b.id === item.Book.id))
          purchasedBooks.push(item.Book);
      }
    });

    const readingDNA = Object.keys(genreCounts)
      .map((genre) => ({
        genre,
        count: genreCounts[genre],
        percentage: Math.round((genreCounts[genre] / totalBooksRead) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const points = user.loyaltyPoints || 0;
    let tier = {
      name: "Novice Reader",
      color: "linear-gradient(135deg, #b87333, #e29b68)",
      nextLimit: 500,
      icon: "🥉",
    };
    if (points >= 500 && points < 2000)
      tier = {
        name: "Avid Scholar",
        color: "linear-gradient(135deg, #9ca3af, #f3f4f6)",
        nextLimit: 2000,
        icon: "🥈",
      };
    else if (points >= 2000)
      tier = {
        name: "Library Grandmaster",
        color: "linear-gradient(135deg, #fbbf24, #fef08a)",
        nextLimit: 5000,
        icon: "👑",
      };

    const topGenre = readingDNA.length > 0 ? readingDNA[0].genre : null;

    let welcomeCoupon = await Coupon.findOne({
      where: { isFirstOrderOnly: true, isActive: true, sponsor: "platform" },
      order: [["createdAt", "DESC"]],
    });

    if (!welcomeCoupon) {
      welcomeCoupon = await Coupon.findOne({
        where: { isActive: true, sponsor: "platform" },
        order: [["createdAt", "DESC"]],
      });
    }

    res.status(200).json({
      loyaltyPoints: points,
      tier,
      readingDNA,
      totalBooksRead,
      topGenre,
      bookshelf: purchasedBooks.slice(0, 12),
      welcomeCoupon,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
