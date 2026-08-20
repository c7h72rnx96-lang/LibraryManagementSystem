import { Router } from "express";
import { createOrder, getUserOrders } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);

export default router;
