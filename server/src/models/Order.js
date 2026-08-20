import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grandTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    // Shipping Details
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },

    // Payment & Status
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "COD",
    }, // COD, Wallet, Bank
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending",
    }, // Pending, Paid
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Processing",
    }, // Processing, Shipped, Delivered, Cancelled
  },
  {
    tableName: "orders",
    timestamps: true,
  },
);

export default Order;
