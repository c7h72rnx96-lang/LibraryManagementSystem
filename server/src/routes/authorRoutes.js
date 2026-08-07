import { Router } from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createAuthorValidator,
  updateAuthorValidator,
  authorIdValidator,
} from "../validators/authorValidator.js";

const router = Router();

// Public Routes
router.get("/", getAllAuthors);
router.get("/:id", authorIdValidator, validate, getAuthorById);

// Protected Routes (Requires Login)
router.post("/", authenticate, createAuthorValidator, validate, createAuthor);
router.put("/:id", authenticate, updateAuthorValidator, validate, updateAuthor);
router.delete("/:id", authenticate, authorIdValidator, validate, deleteAuthor);

export default router;
