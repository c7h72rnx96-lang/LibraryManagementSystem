import { Cart, CartItem, Book } from "../models/index.js";

// 1. Get the current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // We get this from the logged-in user token

    // Find the cart and include all the attached Books!
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Book], // Injects the book details (title, image) into the cart item
        },
      ],
    });

    if (!cart) {
      return res.status(200).json({ CartItems: [] }); // Return empty cart if they don't have one yet
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Server error fetching cart" });
  }
};

// 2. Add a book to the cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body; // The frontend will send the ID of the book they clicked

    // Find the user's cart, or create a brand new one if they don't have one
    let [cart] = await Cart.findOrCreate({
      where: { userId },
    });

    // Check if this specific book is already in their cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, bookId },
    });

    if (cartItem) {
      // If it's already there, just increase the quantity
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // If it's not there, add it as a new item!
      await CartItem.create({
        cartId: cart.id,
        bookId,
        quantity: 1,
      });
    }

    res.status(200).json({ message: "Book successfully added to cart!" });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: "Server error adding to cart" });
  }
};

// 3. Remove an item from the cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params; // We get the specific cart item ID from the URL

    const cartItem = await CartItem.findByPk(itemId);
    if (cartItem) {
      await cartItem.destroy(); // Deletes it from the database entirely
    }

    res.status(200).json({ message: "Item removed successfully!" });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ message: "Server error removing item" });
  }
};
