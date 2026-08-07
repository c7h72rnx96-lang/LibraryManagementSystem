import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static("src/uploads")); // <-- NEW: Makes images viewable

app.get("/", (req, res) => {
  res.json({
    message: "Library Management API Running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
