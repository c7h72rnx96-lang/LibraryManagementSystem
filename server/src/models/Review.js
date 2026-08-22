import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Review = sequelize.define(
  "Review",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }, // Forces ratings to be 1, 2, 3, 4, or 5 stars!
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "reviews",
    timestamps: true,
  },
);

export default Review;
