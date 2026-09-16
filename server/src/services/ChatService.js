// === src/services/ChatService.js ===
import {
  Conversation,
  ChatMessage,
  User,
  Order,
  OrderItem,
} from "../models/index.js";
import { Op } from "sequelize";
import { AppError } from "../utils/AppError.js";

export const ChatService = {
  // Add this inside ChatService
  async getUnreadCount(userId) {
    return await ChatMessage.count({
      include: [
        {
          model: Conversation,
          required: true,
          where: {
            [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
          },
        },
      ],
      where: { senderId: { [Op.ne]: userId }, isRead: false },
    });
  },
  // -----------------------------------------------------
  // EXISTING LOGIC: Fetching data and partners
  // -----------------------------------------------------
  async getConversations(userId) {
    return await Conversation.findAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: [
        {
          model: User,
          as: "Participant1",
          attributes: [
            "id",
            "username",
            "role",
            "storeName",
            "avatar",
            "email",
          ],
        },
        {
          model: User,
          as: "Participant2",
          attributes: [
            "id",
            "username",
            "role",
            "storeName",
            "avatar",
            "email",
          ],
        },
      ],
    });
  },

  async getHistory(userId, partnerId) {
    const conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: userId, participant2Id: partnerId },
          { participant1Id: partnerId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) return [];

    return await ChatMessage.findAll({
      where: { conversationId: conversation.id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
  },

  async getPartners(userId, role) {
    let partners = [];
    const admin = await User.findOne({
      where: { role: "admin" },
      attributes: ["id", "username", "role", "storeName", "avatar", "email"],
    });

    if (role === "customer") {
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: User,
                as: "Seller",
                attributes: [
                  "id",
                  "username",
                  "role",
                  "storeName",
                  "avatar",
                  "email",
                ],
              },
            ],
          },
        ],
      });
      const sellerMap = new Map();
      orders.forEach((o) =>
        o.OrderItems.forEach((item) => {
          if (item.Seller && item.Seller.id !== userId)
            sellerMap.set(item.Seller.id, item.Seller);
        }),
      );
      if (admin && admin.id !== userId) sellerMap.set(admin.id, admin);
      partners = Array.from(sellerMap.values());
    } else if (role === "seller") {
      const items = await OrderItem.findAll({
        where: { sellerId: userId },
        include: [
          {
            model: Order,
            include: [
              {
                model: User,
                attributes: ["id", "username", "role", "avatar", "email"],
              },
            ],
          },
        ],
      });
      const custMap = new Map();
      items.forEach((item) => {
        if (item.Order && item.Order.User && item.Order.User.id !== userId)
          custMap.set(item.Order.User.id, item.Order.User);
      });
      if (admin && admin.id !== userId) custMap.set(admin.id, admin);
      partners = Array.from(custMap.values());
    } else if (role === "admin") {
      partners = await User.findAll({
        where: { id: { [Op.ne]: userId } },
        attributes: ["id", "username", "role", "storeName", "avatar", "email"],
      });
    }

    return Array.from(new Map(partners.map((p) => [p.id, p])).values());
  },

  // -----------------------------------------------------
  // NEW LOGIC: Real-time Persistence & Authorization
  // -----------------------------------------------------
  async saveAndAuthorizeMessage(senderId, receiverId, text) {
    if (!text || !text.trim())
      throw new AppError("Message cannot be empty", 400);

    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);
    if (!receiver) throw new AppError("Recipient not found", 404);

    // 1. Authorization: Only allow valid chat pairs
    if (sender.role === "customer" && receiver.role === "customer") {
      throw new AppError("Customers cannot message each other directly.", 403);
    }
    if (sender.role === "seller" && receiver.role === "seller") {
      throw new AppError("Sellers cannot message each other directly.", 403);
    }

    // 2. Find or Create Conversation securely
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: senderId, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: senderId },
        ],
      },
    });

    if (!conversation) {
      // If Customer <-> Seller, verify an order exists between them
      if (
        (sender.role === "customer" && receiver.role === "seller") ||
        (sender.role === "seller" && receiver.role === "customer")
      ) {
        const customerId = sender.role === "customer" ? senderId : receiverId;
        const sellerId = sender.role === "seller" ? senderId : receiverId;

        const validOrder = await OrderItem.findOne({
          where: { sellerId },
          include: [{ model: Order, where: { userId: customerId } }],
        });

        if (!validOrder)
          throw new AppError(
            "You can only message a seller after purchasing from them.",
            403,
          );
      }
      conversation = await Conversation.create({
        participant1Id: senderId,
        participant2Id: receiverId,
      });
    }

    // 3. Persist the message
    const message = await ChatMessage.create({
      conversationId: conversation.id,
      senderId,
      message: text,
      isRead: false,
    });

    // Populate sender info for the broadcast
    return await ChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
    });
  },

  async markAsRead(userId, conversationId) {
    await ChatMessage.update(
      { isRead: true },
      {
        where: { conversationId, senderId: { [Op.ne]: userId }, isRead: false },
      },
    );
  },
};
