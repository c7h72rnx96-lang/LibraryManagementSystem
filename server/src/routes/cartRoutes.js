import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity, // <-- NEW
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getCart);
router.post("/add", authenticate, addToCart);
router.put("/:itemId", authenticate, updateCartItemQuantity); // <-- NEW
router.delete("/:itemId", authenticate, removeFromCart);

export default router;
