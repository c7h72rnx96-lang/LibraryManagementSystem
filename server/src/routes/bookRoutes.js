import { Router } from "express";
import upload from "../config/multer.js";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview,
} from "../controllers/bookController.js";
import { authenticate, authorize } from "../middleware/auth.js"; // <-- Combined these!

const router = Router();

// Everyone can view books
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Logged-in users can leave reviews
router.post("/:id/reviews", authenticate, addReview); // <-- DON'T FORGET THIS ROUTE!

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
