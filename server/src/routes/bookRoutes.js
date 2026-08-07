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

const router = Router();

// PUBLIC ROUTES
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// PROTECTED ROUTES
router.post("/", authenticate, upload.single("image"), createBook);
router.put("/:id", authenticate, upload.single("image"), updateBook);
router.delete("/:id", authenticate, deleteBook);

export default router;
