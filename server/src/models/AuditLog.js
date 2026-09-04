import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    adminId: { type: DataTypes.INTEGER, allowNull: false }, // The admin/user who took the action
    action: { type: DataTypes.STRING, allowNull: false }, // e.g., 'BLOCK_USER', 'SETTLE_PAYOUT'
    targetType: { type: DataTypes.STRING, allowNull: false }, // e.g., 'User', 'Coupon', 'Order'
    targetId: { type: DataTypes.INTEGER, allowNull: false }, // The ID of the affected record
    details: { type: DataTypes.TEXT, allowNull: true }, // Optional JSON string explaining what changed
    ipAddress: { type: DataTypes.STRING, allowNull: true }, // Security tracking
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false, // Audit logs should be immutable, so we only need createdAt
  },
);

export default AuditLog;
