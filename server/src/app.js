import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// 1. SECURITY: Hide Express identity & secure HTTP headers
// We disable Cross-Origin Resource Policy so frontend can load Cloudinary/Placeholder images
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. SECURITY: Rate Limiting (Prevents DDoS & Brute Force attacks)
// === src/app.js (Excerpt) ===

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 🔥 INCREASED from 200 to 5000 to allow Bulk Uploads & Live Searches
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use("/api/", limiter); // Apply to all /api/ routes

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
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
