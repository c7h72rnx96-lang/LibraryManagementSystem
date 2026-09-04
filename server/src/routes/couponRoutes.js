import { Router } from "express";
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  toggleCouponStatus,
  deleteCoupon,
  generateBulkCoupons, // <-- NEW
} from "../controllers/couponController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/validate", authenticate, validateCoupon);
router.get("/", authenticate, authorize("admin"), getAllCoupons);
router.post("/", authenticate, authorize("admin"), createCoupon);
router.post("/bulk", authenticate, authorize("admin"), generateBulkCoupons); // <-- NEW
router.put("/:id/toggle", authenticate, authorize("admin"), toggleCouponStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteCoupon);

export default router;
