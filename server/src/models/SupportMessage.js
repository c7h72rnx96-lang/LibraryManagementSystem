// === src/models/SupportMessage.js ===
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // <-- FIX: Added curly braces

const SupportMessage = sequelize.define("SupportMessage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default SupportMessage;
