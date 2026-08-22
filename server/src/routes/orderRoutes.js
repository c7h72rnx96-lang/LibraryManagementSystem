import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails,
  getDashboardStats,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
// Customer routes
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);

// Admin routes
router.get("/all", authenticate, getAllOrders);
router.get("/admin/stats", authenticate, getDashboardStats);
router.put("/:id/status", authenticate, updateOrderStatus);
router.get("/admin/:id", authenticate, getOrderDetails);
export default router;
