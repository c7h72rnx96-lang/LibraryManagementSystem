import { body } from "express-validator";

export const registerValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),

  body("email").isEmail().withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];
