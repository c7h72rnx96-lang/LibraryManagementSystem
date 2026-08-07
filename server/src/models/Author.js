import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Author = sequelize.define(
  "Author",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "authors",
    timestamps: true,
  },
);

export default Author;
