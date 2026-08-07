import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Genre = sequelize.define(
  "Genre",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "genres",
    timestamps: true,
  },
);

export default Genre;
