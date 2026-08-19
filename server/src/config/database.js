import { Sequelize } from "sequelize";
import { config } from "./index.js";

// Connect to the Neon Cloud Database using the URL from your .env file
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This is required to securely connect to Neon from Render!
    },
  },
});
