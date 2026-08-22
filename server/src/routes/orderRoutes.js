import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails,
  getDashboardStats,
  toggleItemPackedStatus, // <-- NEW IMPORT
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

// NEW ROUTE: Checkbox saving
router.put(
  "/admin/:orderId/items/:itemId/pack",
  authenticate,
  toggleItemPackedStatus,
);

export default router;
