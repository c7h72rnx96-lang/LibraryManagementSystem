import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },

    // 1. Core Mechanics
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed", "free_shipping"),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    minOrderAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    maxDiscountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    // 2. The Ledger Problem (Who pays for the discount?)
    sponsor: {
      type: DataTypes.ENUM("platform", "seller"),
      allowNull: false,
      defaultValue: "platform",
    },
    sellerId: { type: DataTypes.INTEGER, allowNull: true },

    // 3. Inclusion/Exclusion Rules
    applicableGenreId: { type: DataTypes.INTEGER, allowNull: true },
    excludeDiscountedItems: { type: DataTypes.BOOLEAN, defaultValue: false },

    // 4. Segmentation & Stackability
    isStackable: { type: DataTypes.BOOLEAN, defaultValue: false },
    isFirstOrderOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
    minimumTier: { type: DataTypes.STRING, defaultValue: "free" },

    // 5. Scarcity
    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "coupons",
    timestamps: true,
  },
);

export default Coupon;
