import { Router } from "express";
import {
  getAllUsers,
  toggleBlockUser,
  reviewSellerApplication, // <-- ADDED MISSING IMPORT
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Only the Main Admin can access these routes
router.get("/users", authenticate, authorize("admin"), getAllUsers);
router.put(
  "/users/:id/block",
  authenticate,
  authorize("admin"),
  toggleBlockUser,
);
router.put(
  "/users/:id/approve",
  authenticate,
  authorize("admin"),
  reviewSellerApplication,
);

export default router;
