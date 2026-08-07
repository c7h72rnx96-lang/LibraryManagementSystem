import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    genreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "books",
    timestamps: true,
  },
);

import Author from "./Author.js";
import Genre from "./Genre.js";

Book.belongsTo(Author, {
  foreignKey: "authorId",
});

Book.belongsTo(Genre, {
  foreignKey: "genreId",
});

Author.hasMany(Book, {
  foreignKey: "authorId",
});

Genre.hasMany(Book, {
  foreignKey: "genreId",
});
export default Book;
