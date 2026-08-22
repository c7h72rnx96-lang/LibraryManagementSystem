import { body } from "express-validator";

export const registerValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),

  // Added .trim() here so accidental spaces don't break registration!
  body("email").trim().isEmail().withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  // Added .trim() here so accidental spaces don't break login!
  body("email").trim().isEmail().withMessage("Please enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];
