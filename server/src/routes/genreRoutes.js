import { Router } from "express";
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createGenreValidator,
  updateGenreValidator,
  genreIdValidator,
} from "../validators/genreValidator.js";

const router = Router();

// Public Routes
router.get("/", getAllGenres);
router.get("/:id", genreIdValidator, validate, getGenreById);

// Protected Routes (Requires Login)
router.post("/", authenticate, createGenreValidator, validate, createGenre);
router.put("/:id", authenticate, updateGenreValidator, validate, updateGenre);
router.delete("/:id", authenticate, genreIdValidator, validate, deleteGenre);

export default router;
