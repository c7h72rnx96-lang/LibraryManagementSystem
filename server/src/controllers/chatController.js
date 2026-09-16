import { ChatService } from "../services/ChatService.js";
import { User } from "../models/index.js";

export const getConversations = async (req, res, next) => {
  try {
    const result = await ChatService.getConversations(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPartners = async (req, res, next) => {
  try {
    const result = await ChatService.getPartners(req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const result = await ChatService.getHistory(
      req.user.id,
      req.params.partnerId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminInfo = async (req, res, next) => {
  try {
    const admin = await User.findOne({ where: { role: "admin" } });
    res.status(200).json({ adminId: admin?.id });
  } catch (error) {
    next(error);
  }
};
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await ChatService.getUnreadCount(req.user.id);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};
