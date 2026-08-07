import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};
