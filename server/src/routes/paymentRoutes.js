import { Router } from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Route to generate the Stripe Checkout URL
router.post("/create-session", authenticate, createCheckoutSession);

export default router;
