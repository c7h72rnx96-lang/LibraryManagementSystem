import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priceAtPurchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    isPacked: { type: DataTypes.BOOLEAN, defaultValue: false }, // <-- NEW FIELD
  },
  {
    tableName: "order_items",
    timestamps: true,
  },
);

export default OrderItem;
