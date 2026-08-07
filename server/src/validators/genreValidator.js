import { body, param } from "express-validator";

export const createGenreValidator = [
  body("name").trim().notEmpty().withMessage("Genre name is required"),
];

export const updateGenreValidator = [
  param("id").isInt().withMessage("Invalid genre id"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Genre name cannot be empty"),
];

export const genreIdValidator = [
  param("id").isInt().withMessage("Invalid genre id"),
];
