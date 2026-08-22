import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js"; // <-- NEW IMPORT

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://friendly-creponne-7f3883.netlify.app",
      "https://librarymanagementsystem-2-qqad.onrender.com",
      "https://aashish7.me",
      "https://www.aashish7.me",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Library Management API Running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes); // <-- MOUNTED ROUTE

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
