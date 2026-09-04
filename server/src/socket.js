// === src/socket.js ===
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./config/index.js";
import { User, Conversation, ChatMessage } from "./models/index.js";
import { Op } from "sequelize";

export const initializeSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error: Token missing"));

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);

      if (!user || user.isBlocked)
        return next(new Error("User invalid or suspended"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    connectedUsers.set(userId, socket.id);

    socket.on("send_message", async (data) => {
      try {
        const { receiverId, message } = data;

        if (userId === Number(receiverId)) {
          return socket.emit("error", { message: "Cannot message yourself." });
        }

        let conversation = await Conversation.findOne({
          where: {
            [Op.or]: [
              { participant1Id: userId, participant2Id: receiverId },
              { participant1Id: receiverId, participant2Id: userId },
            ],
          },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participant1Id: userId,
            participant2Id: receiverId,
          });
        }

        const savedMessage = await ChatMessage.create({
          conversationId: conversation.id,
          senderId: userId,
          message: message,
        });

        const populatedMessage = await ChatMessage.findByPk(savedMessage.id, {
          include: [
            {
              model: User,
              as: "Sender",
              attributes: ["id", "username", "avatar", "role"],
            },
          ],
        });

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(Number(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", populatedMessage);
        }

        // Send confirmation back to sender
        socket.emit("message_sent", populatedMessage);
      } catch (error) {
        console.error("Socket send error:", error);
        socket.emit("error", { message: "Failed to transmit message." });
      }
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
    });
  });

  return io;
};
