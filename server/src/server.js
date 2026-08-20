import app from "./app.js";
import { config } from "./config/index.js";
import { sequelize } from "./config/database.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();

    // --- TEMPORARY DATABASE CLEANSE ---

    // This rebuilds the tables with the correct rules
    await sequelize.sync({ alter: true });

    console.log("✅ Database Connected & Carts Fixed!");

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
