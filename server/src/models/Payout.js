import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Payout = sequelize.define(
  "Payout",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sellerId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "Settled" },
  },
  {
    tableName: "payouts",
    timestamps: true,
  },
);

export default Payout;
