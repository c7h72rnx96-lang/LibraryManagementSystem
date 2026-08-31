import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "customer" }, // 'customer', 'seller', 'admin'
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationCode: { type: DataTypes.STRING, allowNull: true },
    codeExpiresAt: { type: DataTypes.DATE, allowNull: true },

    phone: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },

    // --- MARKETPLACE & SECURITY ---
    isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    storeName: { type: DataTypes.STRING, allowNull: true },
    storeDescription: { type: DataTypes.TEXT, allowNull: true },

    // --- ADVANCED PLATFORM FEATURES ---
    storeStatus: { type: DataTypes.STRING, defaultValue: "approved" }, // 'pending', 'approved', 'rejected'
    commissionRate: { type: DataTypes.FLOAT, defaultValue: 10.0 }, // Admin takes 10% by default
    walletBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 }, // Seller's unpaid earnings
    loyaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 }, // For customer gamification
    subscriptionTier: { type: DataTypes.STRING, defaultValue: "free" }, // 'free', 'pro', 'premium' for sellers
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

export default User;
