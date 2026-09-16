import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  // 1. Check for cookie first (Primary secure method)
  let token = req.cookies?.token;

  // 2. Fallback to Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findByPk(decoded.id);
    if (!user)
      return res.status(401).json({ message: "User no longer exists." });
    if (user.isBlocked)
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });

    // 🔥 Sliding Session Expiration
    // If the token expires in less than 6 hours, generate a fresh one and attach to cookies
    const timeRemaining = decoded.exp - Math.floor(Date.now() / 1000);
    // === src/middleware/auth.js ===
    if (timeRemaining < 6 * 3600) {
      const refreshedToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        config.jwt.secret,
        { expiresIn: "1d" }, // The JWT itself still needs an expiration
      );

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", refreshedToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        // REMOVE maxAge here too!
        // maxAge: 24 * 60 * 60 * 1000,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired session. Please log in again." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
