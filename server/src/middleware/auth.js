import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if user exists and is NOT blocked
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User no longer exists." });
    if (user.isBlocked)
      return res
        .status(403)
        .json({ error: "Your account has been suspended by the Admin." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// NEW: Flexible Role Checker
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
