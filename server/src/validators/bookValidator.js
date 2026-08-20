import { body, param } from "express-validator";

export const createBookValidator = [
  body("title").trim().notEmpty().withMessage("Book title is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock cannot be negative"),
  body("price").isFloat({ min: 0 }).withMessage("Price cannot be negative"),
  body("discountPercentage")
    .isInt({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("authorId").isInt().withMessage("Author is required"),
  body("genreId").isInt().withMessage("Genre is required"),
];

export const updateBookValidator = [
  param("id").isInt().withMessage("Invalid book id"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Book title cannot be empty"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),
  body("discountPercentage")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("authorId").optional().isInt(),
  body("genreId").optional().isInt(),
];

export const bookIdValidator = [
  param("id").isInt().withMessage("Invalid book id"),
];
