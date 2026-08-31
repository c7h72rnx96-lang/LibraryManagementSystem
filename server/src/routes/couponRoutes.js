import { Router } from "express";
import {
  validateCoupon,
  createCoupon,
} from "../controllers/couponController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/validate", authenticate, validateCoupon);
router.post("/", authenticate, authorize("admin"), createCoupon);

export default router;
