import {
  User,
  Book,
  Order,
  OrderItem,
  Payout,
  AuditLog,
} from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { logAdminAction } from "../utils/logger.js";
import { ITEM_STATUS } from "../constants/appConstants.js";

export const AdminService = {
  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
  },

  async toggleBlockUser(adminId, ip, targetUserId) {
    const user = await User.findByPk(targetUserId);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "admin") throw new AppError("Cannot block admin!", 400);

    user.isBlocked = !user.isBlocked;
    await user.save();

    await logAdminAction(
      { user: { id: adminId }, ip },
      user.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
      "User",
      user.id,
    );

    return { message: "User status updated." };
  },

  async reviewSellerApplication(sellerId, status, commissionRate) {
    const seller = await User.findByPk(sellerId);
    if (!seller || seller.role !== "seller")
      throw new AppError("Seller not found.", 404);

    seller.storeStatus = status;
    if (commissionRate) seller.commissionRate = commissionRate;
    await seller.save();

    return { message: `Seller store is now ${status}!`, seller };
  },

  async settleSellerPayout(adminId, ip, sellerId) {
    const seller = await User.findByPk(sellerId);
    if (!seller || seller.role !== "seller")
      throw new AppError("Seller not found.", 404);

    const amountToSettle = Number(seller.walletBalance);
    if (amountToSettle <= 0)
      throw new AppError("Seller balance is already zero.", 400);

    await Payout.create({
      sellerId: seller.id,
      amount: amountToSettle,
      status: "Settled",
    });

    seller.walletBalance = 0;
    await seller.save();

    await logAdminAction(
      { user: { id: adminId }, ip },
      "SETTLE_PAYOUT",
      "User",
      seller.id,
      `Settled Rs. ${amountToSettle}`,
    );

    return {
      message: "Seller balance has been settled.",
      amount: amountToSettle,
    };
  },

  async getUserDetails(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new AppError("User not found", 404);

    let stats = null,
      payouts = [],
      recentItems = [];

    if (user.role === "seller") {
      const booksCount = await Book.count({ where: { sellerId: user.id } });
      const items = await OrderItem.findAll({ where: { sellerId: user.id } });

      const lifetimeEarnings = items
        .filter((i) => i.itemStatus === ITEM_STATUS.DELIVERED)
        .reduce((sum, i) => sum + Number(i.sellerEarnings), 0);

      const pendingValue = items
        .filter((i) => i.itemStatus !== ITEM_STATUS.DELIVERED)
        .reduce((sum, i) => sum + Number(i.sellerEarnings), 0);

      const lifetimeCommission = items
        .filter((i) => i.itemStatus === ITEM_STATUS.DELIVERED)
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

    return { user, stats, payouts, recentItems };
  },
};
