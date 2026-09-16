// === src/services/cartService.js ===
import { Cart, CartItem, Book } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const CartService = {
  async getCart(userId) {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Book],
        },
      ],
    });

    return cart || { CartItems: [] };
  },

  async addToCart(userId, bookId) {
    let [cart] = await Cart.findOrCreate({
      where: { userId },
    });

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, bookId },
    });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        bookId,
        quantity: 1,
      });
    }
  },

  async removeFromCart(userId, itemId) {
    // SECURITY FIX: Verify the cart item belongs to the authenticated user's cart
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Cart,
          where: { userId },
          attributes: ["id"],
        },
      ],
    });

    if (!cartItem) {
      throw new AppError("Item not found or unauthorized access", 403);
    }

    await cartItem.destroy();
  },

  async updateQuantity(userId, itemId, quantity) {
    // SECURITY FIX: Verify the cart item belongs to the authenticated user's cart
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Cart,
          where: { userId },
          attributes: ["id"],
        },
      ],
    });

    if (!cartItem) {
      throw new AppError("Item not found or unauthorized access", 403);
    }

    cartItem.quantity = quantity;
    await cartItem.save();
  },
};
