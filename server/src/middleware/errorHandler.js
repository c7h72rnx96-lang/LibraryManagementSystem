import { AppError } from "../utils/AppError.js";

export const notFoundHandler = (req, res, next) => {
  next(
    new AppError(`Route ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"),
  );
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (!err.isOperational && process.env.NODE_ENV !== "test") {
    console.error("🔥 UNEXPECTED ERROR:", err);
  }

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    const message = err.errors.map((e) => e.message).join(", ");
    error = new AppError(message, 400, "VALIDATION_ERROR");
  }

  if (err.name === "JsonWebTokenError") {
    error = new AppError(
      "Invalid token. Please log in again.",
      401,
      "AUTH_INVALID_TOKEN",
    );
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError(
      "Your session has expired.",
      401,
      "AUTH_TOKEN_EXPIRED",
    );
  }

  // Strict Phase 3 Error Format
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.errorCode || "INTERNAL_ERROR",
      message: error.isOperational ? error.message : "Internal Server Error",
    },
  });
};
