import app from "./app.js";
import { config } from "./config/index.js";
import { sequelize } from "./config/database.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log("✅ Database Connected");

    app.listen(config.port, () => {
      console.log(`🚀 Server running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
