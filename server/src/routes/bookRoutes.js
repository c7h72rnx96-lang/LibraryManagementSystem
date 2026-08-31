// === server/src/routes/bookRoutes.js ===
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
  deleteBulkBooks, // <-- Add this import
} from "../controllers/bookController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Bulk Routes (MUST go before /:id routes!)
router.post(
  "/bulk",
  authenticate,
  authorize("admin", "seller"),
  createBulkBooks,
);
// 🔥 NEW: Bulk Delete Route
router.delete(
  "/bulk",
  authenticate,
  authorize("admin", "seller"),
  deleteBulkBooks,
);

// Everyone can view books
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
