import { sequelize } from "../config/database.js";
import "../models/index.js";

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected successfully.");

    await sequelize.sync({ alter: true });
    console.log(" Database synchronized successfully.");

    process.exit(0);
  } catch (error) {
    console.error(" Database sync failed:");
    console.error(error);
    process.exit(1);
  }
};

syncDatabase();
