import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },

    // --- SPLIT ROUTING & COMMISSION ENGINE ---
    sellerId: { type: DataTypes.INTEGER, allowNull: false }, // Knows exactly which seller sold this
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priceAtPurchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    commissionCut: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    }, // Admin's Cut
    sellerEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    }, // Seller's Cut

    // --- SELLER LOGISTICS ---
    itemStatus: { type: DataTypes.STRING, defaultValue: "Pending" }, // 'Pending', 'Packed', 'Shipped'
  },
  {
    tableName: "order_items",
    timestamps: true,
  },
);

export default OrderItem;
