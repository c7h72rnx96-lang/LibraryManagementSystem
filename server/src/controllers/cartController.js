// === src/controllers/cartController.js ===
import { CartService } from "../services/cartService.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await CartService.getCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    await CartService.addToCart(req.user.id, req.body.bookId);
    res.status(200).json({ message: "Book successfully added to cart!" });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    await CartService.removeFromCart(req.user.id, req.params.itemId);
    res.status(200).json({ message: "Item removed successfully!" });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    await CartService.updateQuantity(
      req.user.id,
      req.params.itemId,
      req.body.quantity,
    );
    res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    next(error);
  }
};
