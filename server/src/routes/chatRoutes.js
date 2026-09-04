// === src/routes/chatRoutes.js ===
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  Conversation,
  ChatMessage,
  User,
  Order,
  OrderItem,
} from "../models/index.js";
import { Op } from "sequelize";

const router = Router();

router.get("/conversations", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
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
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// 🔥 FIX: Deduplicated contact list
router.get("/partners", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
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

      // Add admin safely using the Map so they don't duplicate if they are also a seller
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
        if (item.Order && item.Order.User && item.Order.User.id !== userId) {
          custMap.set(item.Order.User.id, item.Order.User);
        }
      });

      // Add admin safely
      if (admin && admin.id !== userId) custMap.set(admin.id, admin);
      partners = Array.from(custMap.values());
    } else if (role === "admin") {
      const users = await User.findAll({
        where: { id: { [Op.ne]: userId } },
        attributes: ["id", "username", "role", "storeName", "avatar", "email"],
      });
      partners = users;
    }

    // Final safety deduplication just in case
    const uniquePartners = Array.from(
      new Map(partners.map((p) => [p.id, p])).values(),
    );

    res.json(uniquePartners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch partners" });
  }
});

router.get("/history/:partnerId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    const conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: userId, participant2Id: partnerId },
          { participant1Id: partnerId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) return res.json([]);

    const messages = await ChatMessage.findAll({
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

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.get("/admin", authenticate, async (req, res) => {
  const admin = await User.findOne({ where: { role: "admin" } });
  res.json({ adminId: admin?.id });
});

export default router;
