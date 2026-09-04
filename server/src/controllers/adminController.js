// === src/controllers/adminController.js ===
import {
  User,
  Order,
  OrderItem,
  Book,
  Payout,
  AuditLog,
} from "../models/index.js"; // <-- ADD AuditLog HERE
import { logAdminAction } from "../utils/logger.js";
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const userToBlock = await User.findByPk(req.params.id);
    if (!userToBlock)
      return res.status(404).json({ message: "User not found" });
    if (userToBlock.role === "admin")
      return res.status(400).json({ message: "Cannot block admin!" });

    userToBlock.isBlocked = !userToBlock.isBlocked;
    await userToBlock.save();

    // 🔥 LOG THE ACTION
    await logAdminAction(
      req,
      userToBlock.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
      "User",
      userToBlock.id,
    );

    res.status(200).json({ message: `User status updated.` });
  } catch (error) {
    next(error);
  }
};

// 👑 SELLER APPROVAL
export const reviewSellerApplication = async (req, res, next) => {
  try {
    const { status, commissionRate } = req.body;
    const seller = await User.findByPk(req.params.id);

    if (!seller || seller.role !== "seller")
      return res.status(404).json({ message: "Seller not found." });

    seller.storeStatus = status;
    if (commissionRate) seller.commissionRate = commissionRate;
    await seller.save();

    res.status(200).json({ message: `Seller store is now ${status}!`, seller });
  } catch (error) {
    next(error);
  }
};

// 👑 SETTLE SELLER PAYOUT (UPDATED FOR LEDGER)
export const settleSellerPayout = async (req, res, next) => {
  try {
    const seller = await User.findByPk(req.params.id);
    if (!seller || seller.role !== "seller")
      return res.status(404).json({ message: "Seller not found." });

    const amountToSettle = Number(seller.walletBalance);
    if (amountToSettle <= 0)
      return res
        .status(400)
        .json({ message: "Seller balance is already zero." });

    await Payout.create({
      sellerId: seller.id,
      amount: amountToSettle,
      status: "Settled",
    });
    seller.walletBalance = 0;
    await seller.save();

    // 🔥 LOG THE FINANCIAL ACTION
    await logAdminAction(
      req,
      "SETTLE_PAYOUT",
      "User",
      seller.id,
      `Settled Rs. ${amountToSettle}`,
    );

    res.status(200).json({
      message: "Seller balance has been settled.",
      amount: amountToSettle,
    });
  } catch (error) {
    next(error);
  }
};

// 👑 GET ALL STATEMENTS (LEDGER)
export const getPayoutHistory = async (req, res, next) => {
  try {
    const payouts = await Payout.findAll({
      include: [
        {
          model: User,
          as: "Seller",
          attributes: ["storeName", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(payouts);
  } catch (error) {
    next(error);
  }
};

// 👑 GET SPECIFIC USER DETAILS & STATS
export const getUserDetailsAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    let stats = null;
    let payouts = [];
    let recentItems = [];

    if (user.role === "seller") {
      const booksCount = await Book.count({ where: { sellerId: user.id } });
      const items = await OrderItem.findAll({ where: { sellerId: user.id } });

      // ONLY counts delivered, finished orders
      const lifetimeEarnings = items
        .filter((i) => i.itemStatus === "Delivered")
        .reduce((sum, i) => sum + Number(i.sellerEarnings), 0);

      // 🔥 NEW: Counts money stuck in Processing/Shipped orders!
      const pendingValue = items
        .filter((i) => i.itemStatus !== "Delivered")
        .reduce((sum, i) => sum + Number(i.sellerEarnings), 0);

      const lifetimeCommission = items
        .filter((i) => i.itemStatus === "Delivered")
        .reduce((sum, i) => sum + Number(i.commissionCut), 0);

      payouts = await Payout.findAll({
        where: { sellerId: user.id },
        order: [["createdAt", "DESC"]],
      });

      recentItems = await OrderItem.findAll({
        where: { sellerId: user.id },
        include: [
          { model: Book, attributes: ["title", "image"] },
          { model: Order, attributes: ["id", "createdAt", "fullName"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      stats = {
        booksCount,
        lifetimeEarnings,
        lifetimeCommission,
        pendingValue,
      };
    }

    res.status(200).json({ user, stats, payouts, recentItems });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, as: "Admin", attributes: ["username", "email", "role"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100, // Keep it fast
    });
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// 👑 UPDATE SELLER COMMISSION RATE
export const updateUserCommission = async (req, res, next) => {
  try {
    const { commissionRate } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user || user.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    user.commissionRate = commissionRate;
    await user.save();

    res.status(200).json({
      message: "Commission rate updated successfully!",
      commissionRate: user.commissionRate,
    });
  } catch (error) {
    next(error);
  }
};
