import { Router } from "express";
import upload from "../config/multer.js";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleAuth.js"; // <-- NEW

const router = Router();

// Everyone can view books
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// ONLY Admins can add/edit/delete books
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  createBook,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("image"),
  updateBook,
);
router.delete("/:id", authenticate, requireAdmin, deleteBook);

export default router;
