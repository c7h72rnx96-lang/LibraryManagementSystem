import { body, param } from "express-validator";

export const createBookValidator = [
  body("title").trim().notEmpty().withMessage("Book title is required"),

  body("stock").isInt({ min: 0 }).withMessage("Stock cannot be negative"),

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

  body("authorId").optional().isInt(),

  body("genreId").optional().isInt(),
];

export const bookIdValidator = [
  param("id").isInt().withMessage("Invalid book id"),
];
