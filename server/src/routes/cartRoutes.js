import express from "express";
import { getCart, addToCart } from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // <-- Make sure this matches your auth middleware file path/name!

const router = express.Router();

// Both routes are protected by verifyToken so only logged-in users can use a cart
router.get("/", verifyToken, getCart);
router.post("/add", verifyToken, addToCart);

export default router;
