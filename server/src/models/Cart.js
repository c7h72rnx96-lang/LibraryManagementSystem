import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // The userId will be automatically added by our relationships in index.js!
  },
  {
    tableName: "carts",
    timestamps: true,
  },
);

export default Cart;
