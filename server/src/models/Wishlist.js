import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "wishlists",
    timestamps: true,
  },
);

export default Wishlist;
