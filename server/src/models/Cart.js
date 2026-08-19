import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const CartItem = sequelize.define("CartItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // If they add a book, it defaults to 1 copy
  },
  // The cartId and bookId will be automatically added here in Step 3!
});

export default CartItem;
