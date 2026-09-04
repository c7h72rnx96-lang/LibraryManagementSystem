import { Router } from "express";
import {
  getAllUsers,
  toggleBlockUser,
  reviewSellerApplication,
  settleSellerPayout,
  getPayoutHistory,
  getUserDetailsAdmin, // <-- NEW IMPORT
  updateUserCommission,
  getAuditLogs, // <-- NEW IMPORT
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

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
router.put(
  "/users/:id/settle",
  authenticate,
  authorize("admin"),
  settleSellerPayout,
);
router.get(
  "/payouts/history",
  authenticate,
  authorize("admin"),
  getPayoutHistory,
);
router.get("/logs", authenticate, authorize("admin"), getAuditLogs);

// 🔥 NEW ROUTES FOR DETAILED USER PAGE
router.get("/users/:id", authenticate, authorize("admin"), getUserDetailsAdmin);
router.put(
  "/users/:id/commission",
  authenticate,
  authorize("admin"),
  updateUserCommission,
);

export default router;
