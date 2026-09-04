// === src/models/Conversation.js ===
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Conversation = sequelize.define("Conversation", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  participant1Id: { type: DataTypes.INTEGER, allowNull: false },
  participant2Id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Conversation;
