import { Router } from "express";
import {
  createCheckoutSession,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Route to generate the Stripe Checkout URL
router.post("/create-session", authenticate, createCheckoutSession);

// Route to verify payment success
router.post("/verify", authenticate, verifyPayment);

export default router;
