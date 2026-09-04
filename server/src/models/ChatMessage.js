// === src/models/ChatMessage.js ===
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ChatMessage = sequelize.define("ChatMessage", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default ChatMessage;
