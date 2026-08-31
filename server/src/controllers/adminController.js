import { User, Order, OrderItem, Book } from "../models/index.js";
import { sequelize } from "../config/database.js";

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
    res.status(200).json({ message: `User status updated.` });
  } catch (error) {
    next(error);
  }
};

// 👑 SELLER APPROVAL & COMMISSION OVERRIDE
export const reviewSellerApplication = async (req, res, next) => {
  try {
    const { status, commissionRate } = req.body;
    const seller = await User.findByPk(req.params.id);

    if (!seller || seller.role !== "seller")
      return res.status(404).json({ message: "Seller not found." });

    seller.storeStatus = status; // 'approved' or 'rejected'
    if (commissionRate) seller.commissionRate = commissionRate;
    await seller.save();

    res.status(200).json({ message: `Seller store is now ${status}!`, seller });
  } catch (error) {
    next(error);
  }
};
