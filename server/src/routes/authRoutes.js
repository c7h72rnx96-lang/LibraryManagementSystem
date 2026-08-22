import { Router } from "express";
import {
  login,
  register,
  verify,
  getProfile,
  updateProfile,
  forgotPassword, // <-- NEW
  resetPassword, // <-- NEW
  changePassword, // <-- NEW
} from "../controllers/authController.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = Router();

// Public auth routes
router.post("/login", loginValidator, validate, login);
router.post("/register", registerValidator, validate, register);
router.post("/verify", verify);

// Public password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected profile routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("avatar"), updateProfile);
router.put("/change-password", authenticate, changePassword); // <-- NEW

export default router;
