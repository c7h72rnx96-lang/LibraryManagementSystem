import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "customer" },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationCode: { type: DataTypes.STRING, allowNull: true },
    codeExpiresAt: { type: DataTypes.DATE, allowNull: true },

    // ---> NEW PROFILE FIELDS <---
    phone: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

export default User;
