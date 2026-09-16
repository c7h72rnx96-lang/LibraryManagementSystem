import { Router } from "express";
import upload from "../config/multer.js";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  getRecommendations,
  createBulkBooks,
  deleteBulkBooks,
  lookupExternalBook, // <-- Imported proxy controller
} from "../controllers/bookController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { actionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ==========================================
// 1. SPECIFIC ROUTES (Must go first!)
// ==========================================

// 🔥 SECURE PROXY: Must be placed ABOVE /:id so Express doesn't treat "external-lookup" as an ID
router.get("/external-lookup", authenticate, actionLimiter, lookupExternalBook);

// Bulk Actions
router.post(
  "/bulk",
  authenticate,
  authorize("admin", "seller"),
  createBulkBooks,
);
router.delete(
  "/bulk",
  authenticate,
  authorize("admin", "seller"),
  deleteBulkBooks,
);

// ==========================================
// 2. DYNAMIC /:id ROUTES (Must go after specific routes!)
// ==========================================

// Everyone can view books & recommendations
router.get("/:id/recommendations", getRecommendations);
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Logged-in users can leave reviews
router.post("/:id/reviews", authenticate, addReview);

// ONLY Admins and Sellers can add/edit/delete books
router.post(
  "/",
  authenticate,
  authorize("admin", "seller"),
  upload.single("image"),
  createBook,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "seller"),
  upload.single("image"),
  updateBook,
);
router.delete("/:id", authenticate, authorize("admin", "seller"), deleteBook);

export default router;
