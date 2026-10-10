// === src/socket.js ===
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./config/index.js";
import { User } from "./models/index.js";
import { ChatService } from "./services/ChatService.js";

let ioInstance;
const onlineUsers = new Set();

// Rate Limiters to prevent DB/Server crash from spam
const messageRateLimiter = new Map();
const typingRateLimiter = new Map();

export const emitToUser = (userId, event, data) => {
  if (ioInstance) ioInstance.to(`user_${userId}`).emit(event, data);
};

export const initializeSockets = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://aashish7.me",
        "https://www.aashish7.me",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Strict Authentication via HttpOnly Cookie (Native parsing to prevent crashes)
  ioInstance.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const cookies = {};
      cookieHeader.split(";").forEach((c) => {
        const [key, value] = c.split("=").map((v) => v.trim());
        if (key) cookies[key] = value;
      });

      if (!cookies.token) {
        console.error("🔴 Socket Auth: Token missing from cookies");
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(cookies.token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);

      if (!user || user.isBlocked) {
        console.error("🔴 Socket Auth: User invalid or suspended");
        return next(new Error("User invalid or suspended"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("🔥 Socket Auth Exception:", err.message);
      next(new Error("Authentication error"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user.id;

    // Join secure personal room
    socket.join(`user_${userId}`);
    onlineUsers.add(userId);
    ioInstance.emit("presence:update", Array.from(onlineUsers));

    // 📩 HANDLE NEW MESSAGES
    socket.on("message:send", async (payload, callback) => {
      // 🛡️ ABUSE PROTECTION: Max 5 messages per 2 seconds
      const now = Date.now();
      const userTimestamps = messageRateLimiter.get(userId) || [];
      const recent = userTimestamps.filter((t) => now - t < 2000);

      if (recent.length >= 5) {
        if (typeof callback === "function") {
          callback({
            success: false,
            error: { message: "Slow down! You're sending messages too fast." },
          });
        }
        return;
      }

      recent.push(now);
      messageRateLimiter.set(userId, recent);

      try {
        const { receiverId, message } = payload;

        // Save to DB and Authorize securely
        const savedMessage = await ChatService.saveAndAuthorizeMessage(
          userId,
          receiverId,
          message,
        );

        // 🔥 Safely serialize the Sequelize DB object for cross-network Socket delivery
        const plainMessage = savedMessage.get
          ? savedMessage.get({ plain: true })
          : savedMessage;

        // Emit to the recipient
        socket.to(`user_${receiverId}`).emit("message:new", plainMessage);

        // 🔔 Emit Global Notification for Unread Counts/Toasts
        socket.to(`user_${receiverId}`).emit("notification:new", {
          title: `New message from ${socket.user.username}`,
          message:
            message.substring(0, 40) + (message.length > 40 ? "..." : ""),
          senderId: userId,
        });

        // Send success back to React!
        if (typeof callback === "function") {
          callback({ success: true, data: plainMessage });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({ success: false, error: { message: error.message } });
        }
      }
    });

    // 📖 HANDLE READ RECEIPTS
    socket.on("message:read", async ({ conversationId }) => {
      // Block crash if frontend tries to pass an undefined ID
      if (!conversationId) return;

      try {
        await ChatService.markAsRead(userId, conversationId);
      } catch (error) {
        console.error("Read status error:", error);
      }
    });

    // ✍️ HANDLE TYPING INDICATORS
    socket.on("typing:start", ({ receiverId }) => {
      // 🛡️ ABUSE PROTECTION: Throttle typing emit to 1 per second
      const lastTyping = typingRateLimiter.get(userId) || 0;
      if (Date.now() - lastTyping > 1000) {
        typingRateLimiter.set(userId, Date.now());
        socket
          .to(`user_${receiverId}`)
          .emit("typing:status", { senderId: userId, isTyping: true });
      }
    });

    socket.on("typing:stop", ({ receiverId }) => {
      socket
        .to(`user_${receiverId}`)
        .emit("typing:status", { senderId: userId, isTyping: false });
    });

    // 🔌 HANDLE DISCONNECT
    socket.on("disconnect", async () => {
      const sockets = await ioInstance.in(`user_${userId}`).fetchSockets();
      if (sockets.length === 0) {
        onlineUsers.delete(userId);
        ioInstance.emit("presence:update", Array.from(onlineUsers));
        messageRateLimiter.delete(userId);
        typingRateLimiter.delete(userId);
      }
    });
  });
};
