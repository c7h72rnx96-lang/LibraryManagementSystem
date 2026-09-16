import rateLimit from "express-rate-limit";

// 1. Strict Limiter: For Login, Register, Forgot Password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// 2. Action Limiter: For high-risk endpoints (Checkout, Support Tickets, Coupons)
export const actionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many actions performed. Please slow down.",
  },
});

// 3. Global API Limiter: General DDoS protection
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Rate limit exceeded. Please try again later.",
  },
});
