import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const authenticate = (req, res, next) => {
  console.log("AUTH HEADER RECEIVED BY SERVER:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("TOKEN RECEIVED BY SERVER:", token);

    const decoded = jwt.verify(token, config.jwt.secret);

    console.log("JWT VERIFIED:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      error: "Invalid token",
    });
  }
};
