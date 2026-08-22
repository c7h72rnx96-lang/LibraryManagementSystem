import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
} from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getWishlist);
router.post("/toggle", authenticate, toggleWishlist);

export default router;
