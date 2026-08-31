import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
      defaultValue: "percentage",
    },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    minOrderAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    maxDiscountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    usageLimit: { type: DataTypes.INTEGER, defaultValue: 100 },
    usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "coupons",
    timestamps: true,
  },
);

export default Coupon;
