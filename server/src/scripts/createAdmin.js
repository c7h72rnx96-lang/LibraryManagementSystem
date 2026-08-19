import bcrypt from "bcrypt";
import { sequelize } from "../config/database.js";
import "../models/index.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    const existingAdmin = await User.findOne({
      where: { email: "admin@library.com" },
    });

    if (existingAdmin) {
      console.log(" Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "Administrator",
      email: "admin@library.com",
      password: hashedPassword,
      role: "admin", // <-- NEW: Makes this account an Admin
      isVerified: true,
    });

    console.log(" Admin account created successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
