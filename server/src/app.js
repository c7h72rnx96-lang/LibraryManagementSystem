import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"; // <-- NEW
import { setupSwagger } from "./config/swagger.js";
import { apiLimiter } from "./middleware/rateLimiter.js"; // <-- NEW

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
import supportRoutes from "./routes/supportRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import { stripeWebhook } from "./controllers/paymentController.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cookieParser()); // <-- NEW: Required for HttpOnly cookies

// Global generic API limiter (Light protection)
app.use("/api/", apiLimiter);

// Explicit CORS setup for cross-domain cookies
// Explicit CORS setup for cross-domain cookies
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://friendly-creponne-7f3883.netlify.app",
  "https://librarymanagementsystem-2-qqad.onrender.com",
  "https://aashish7.me",
  "https://www.aashish7.me",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
    credentials: true, // <-- CRITICAL: Allows cookies to be sent
  }),
);

// Stripe Webhook route must go before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
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
app.use("/api/support", supportRoutes);
app.use("/api/chat", chatRoutes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
