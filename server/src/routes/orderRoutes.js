import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails,
  getDashboardStats,
  toggleItemPackedStatus,
  getSellerOrders,
  getSellerWalletStats,
  generateInvoice,
  getCustomerDashboardStats, // <-- 1. ADD THIS IMPORT
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Customer routes
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);

// Admin routes
router.get("/all", authenticate, authorize("admin"), getAllOrders);
router.get("/admin/stats", authenticate, authorize("admin"), getDashboardStats);
router.put("/:id/status", authenticate, authorize("admin"), updateOrderStatus);
router.get("/admin/:id", authenticate, authorize("admin"), getOrderDetails);
router.get("/customer/dashboard", authenticate, getCustomerDashboardStats);
// Seller routes

router.get("/seller", authenticate, authorize("seller"), getSellerOrders);
router.get(
  "/seller/wallet",
  authenticate,
  authorize("seller"),
  getSellerWalletStats,
);

// Shared Admin/Seller route
router.put(
  "/admin/:orderId/items/:itemId/pack",
  authenticate,
  authorize("admin", "seller"),
  toggleItemPackedStatus,
);

// Shared Admin/Customer Invoice Download Route
router.get("/:id/invoice", authenticate, generateInvoice); // <-- 2. ADD THIS ROUTE

export default router;
