import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Author from "./Author.js";
import Genre from "./Genre.js";

const Book = sequelize.define(
  "Book",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    // --- NEW E-COMMERCE FIELDS ---
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discountPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // e.g., 20 means 20% off
    },
    // -----------------------------

    authorId: { type: DataTypes.INTEGER, allowNull: false },
    genreId: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "books",
    timestamps: true,
  },
);

Book.belongsTo(Author, { foreignKey: "authorId" });
Book.belongsTo(Genre, { foreignKey: "genreId" });
Author.hasMany(Book, { foreignKey: "authorId" });
Genre.hasMany(Book, { foreignKey: "genreId" });

export default Book;
