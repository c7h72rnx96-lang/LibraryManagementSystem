// === src/config/index.js ===
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  db: {
    storage: process.env.DB_STORAGE || "./database.sqlite",
  },

  jwt: {
    // 🔥 Use a getter so it reads the live process.env value dynamically at runtime
    get secret() {
      return process.env.JWT_SECRET || "library_management_secret_2026";
    },
  },
};
