import { AdminService } from "../services/AdminService.js";
import { Payout, AuditLog, User } from "../models/index.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await AdminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const result = await AdminService.toggleBlockUser(
      req.user.id,
      req.ip,
      req.params.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const reviewSellerApplication = async (req, res, next) => {
  try {
    const { status, commissionRate } = req.body;
    const result = await AdminService.reviewSellerApplication(
      req.params.id,
      status,
      commissionRate,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const settleSellerPayout = async (req, res, next) => {
  try {
    const result = await AdminService.settleSellerPayout(
      req.user.id,
      req.ip,
      req.params.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserDetailsAdmin = async (req, res, next) => {
  try {
    const result = await AdminService.getUserDetails(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Simple fetches can remain direct if a Service adds no value
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

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, as: "Admin", attributes: ["username", "email", "role"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

export const updateUserCommission = async (req, res, next) => {
  try {
    const result = await AdminService.reviewSellerApplication(
      req.params.id,
      "approved",
      req.body.commissionRate,
    );
    res
      .status(200)
      .json({
        message: "Commission rate updated successfully!",
        commissionRate: req.body.commissionRate,
      });
  } catch (error) {
    next(error);
  }
};
