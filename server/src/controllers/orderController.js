import {
  Cart,
  CartItem,
  Book,
  Order,
  OrderItem,
  User,
  Coupon,
  Payout,
  Genre,
} from "../models/index.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
import PDFDocument from "pdfkit";

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const {
      fullName,
      phone,
      address,
      city,
      paymentMethod,
      cartItemIds,
      couponCode,
      redeemPoints = 0,
    } = req.body;

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
    let eligibleSubtotal = 0;

    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        where: { code: couponCode.trim().toUpperCase(), isActive: true },
        transaction,
      });
    }

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

      const lineTotal = effectivePrice * item.quantity;
      subtotal += lineTotal;

      if (appliedCoupon) {
        let isEligible = true;
        if (appliedCoupon.sellerId && book.sellerId !== appliedCoupon.sellerId)
          isEligible = false;
        if (
          appliedCoupon.applicableGenreId &&
          book.genreId !== appliedCoupon.applicableGenreId
        )
          isEligible = false;
        if (appliedCoupon.excludeDiscountedItems && book.discountPercentage > 0)
          isEligible = false;

        if (isEligible) eligibleSubtotal += lineTotal;
      }
    }

    let couponDiscount = 0;

    if (
      appliedCoupon &&
      eligibleSubtotal >= Number(appliedCoupon.minOrderAmount)
    ) {
      if (appliedCoupon.discountType === "free_shipping") {
        couponDiscount = 0;
      } else if (appliedCoupon.discountType === "percentage") {
        couponDiscount =
          (eligibleSubtotal * Number(appliedCoupon.discountValue)) / 100;
        if (
          appliedCoupon.maxDiscountAmount &&
          couponDiscount > Number(appliedCoupon.maxDiscountAmount)
        ) {
          couponDiscount = Number(appliedCoupon.maxDiscountAmount);
        }
      } else {
        couponDiscount = Math.min(
          Number(appliedCoupon.discountValue),
          eligibleSubtotal,
        );
      }
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save({ transaction });
    } else if (appliedCoupon) {
      appliedCoupon = null;
    }

    const customer = await User.findByPk(userId, { transaction });
    let loyaltyDiscount = 0;

    const requestedPoints =
      appliedCoupon && !appliedCoupon.isStackable
        ? 0
        : Math.max(0, parseInt(redeemPoints) || 0);

    if (requestedPoints > 0) {
      const availablePoints = customer.loyaltyPoints || 0;
      const pointsToRedeem = Math.min(
        requestedPoints,
        availablePoints,
        Math.floor(subtotal - couponDiscount),
      );
      loyaltyDiscount = pointsToRedeem;
      customer.loyaltyPoints -= pointsToRedeem;
    }

    let deliveryFee = subtotal >= 1000 ? 0 : 100;
    if (appliedCoupon && appliedCoupon.discountType === "free_shipping")
      deliveryFee = 0;

    const grandTotal =
      Math.max(0, subtotal - couponDiscount - loyaltyDiscount) + deliveryFee;

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

    let totalLoyaltyPointsEarned = 0;

    for (const item of selectedItems) {
      const book = item.Book;
      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);
      let itemTotal = effectivePrice * item.quantity;
      let itemDiscountShare = 0;

      if (
        appliedCoupon &&
        appliedCoupon.discountType !== "free_shipping" &&
        eligibleSubtotal > 0
      ) {
        let isEligible = true;
        if (appliedCoupon.sellerId && book.sellerId !== appliedCoupon.sellerId)
          isEligible = false;
        if (
          appliedCoupon.applicableGenreId &&
          book.genreId !== appliedCoupon.applicableGenreId
        )
          isEligible = false;
        if (appliedCoupon.excludeDiscountedItems && book.discountPercentage > 0)
          isEligible = false;

        if (isEligible) {
          itemDiscountShare = (itemTotal / eligibleSubtotal) * couponDiscount;
          if (appliedCoupon.sponsor === "seller") {
            itemTotal -= itemDiscountShare;
          }
        }
      }

      const seller = await User.findByPk(book.sellerId, { transaction });
      const commissionRate = seller ? seller.commissionRate : 10.0;
      let commissionCut = itemTotal * (commissionRate / 100);

      if (
        appliedCoupon &&
        appliedCoupon.sponsor === "platform" &&
        itemDiscountShare > 0
      ) {
        commissionCut -= itemDiscountShare;
        if (commissionCut < 0) commissionCut = 0;
      }

      const sellerEarnings = itemTotal - commissionCut;

      await OrderItem.create(
        {
          orderId: order.id,
          bookId: book.id,
          sellerId: book.sellerId,
          quantity: item.quantity,
          priceAtPurchase: effectivePrice,
          commissionCut,
          sellerEarnings,
          itemStatus: "Pending",
        },
        { transaction },
      );

      book.stock -= item.quantity;
      await book.save({ transaction });

      totalLoyaltyPointsEarned += Math.floor(itemTotal / 100);
    }

    customer.loyaltyPoints =
      (customer.loyaltyPoints || 0) + totalLoyaltyPointsEarned;
    await customer.save({ transaction });

    await CartItem.destroy({
      where: { id: { [Op.in]: cartItemIds } },
      transaction,
    });

    await transaction.commit();
    res.status(201).json({
      message: "Order placed successfully!",
      orderId: order.id,
      pointsEarned: totalLoyaltyPointsEarned,
      loyaltyDiscount,
      couponDiscount,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Checkout Error:", error);
    res.status(500).json({ message: "Server error during checkout" });
  }
};

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

export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized. Admin only." });
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

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
        item.itemStatus = "Delivered";
        await item.save();
      }
      if (order.paymentMethod === "COD") order.paymentStatus = "Paid";
    }

    order.orderStatus = orderStatus;
    await order.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully!", order });
  } catch (error) {
    res.status(500).json({ message: "Server error updating order status" });
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

    // 🔥 NEW: Allow Admins, the Customer, OR a Seller who has an item in this order
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

    // ... existing code inside getCustomerDashboardStats ...
    const topGenre = readingDNA.length > 0 ? readingDNA[0].genre : null;

    // 🔥 NEW: Fetch the latest active welcome coupon created by the Admin
    let welcomeCoupon = await Coupon.findOne({
      where: { isFirstOrderOnly: true, isActive: true, sponsor: "platform" },
      order: [["createdAt", "DESC"]],
    });

    // Fallback just in case there isn't a specific "First Order" one, grab any active platform coupon
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
      welcomeCoupon, // <-- Pass the coupon to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
