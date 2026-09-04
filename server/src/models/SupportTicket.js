// === src/models/SupportTicket.js ===
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // <-- FIX: Added curly braces

const SupportTicket = sequelize.define("SupportTicket", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Open", "Closed"),
    defaultValue: "Open",
  },
  priority: {
    type: DataTypes.ENUM("Low", "Normal", "High"),
    defaultValue: "Normal",
  },
});

export default SupportTicket;
