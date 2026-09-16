import { Sequelize } from "sequelize";
import { config } from "./index.js";

// Use an in-memory SQLite database for testing, otherwise use real Postgres
export const sequelize =
  process.env.NODE_ENV === "test"
    ? new Sequelize("sqlite::memory:", { logging: false })
    : new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      });
