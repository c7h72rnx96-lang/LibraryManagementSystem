import { body, param } from "express-validator";

export const createAuthorValidator = [
  body("name").trim().notEmpty().withMessage("Author name is required"),
];

export const updateAuthorValidator = [
  param("id").isInt().withMessage("Invalid author id"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Author name cannot be empty"),
];

export const authorIdValidator = [
  param("id").isInt().withMessage("Invalid author id"),
];
