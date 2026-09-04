// === src/server.js ===
import { createServer } from "http";
import { initializeSockets } from "./socket.js";
import app from "./app.js";
import { config } from "./config/index.js";
import { sequelize } from "./config/database.js"; // <-- This was the missing line!
import { startRetentionJobs } from "./jobs/retention.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected ");

    // Sync is disabled for lightning-fast server starts
    // await sequelize.sync({ alter: true });

    startRetentionJobs();

    const httpServer = createServer(app);
    initializeSockets(httpServer);

    httpServer.listen(config.port, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
