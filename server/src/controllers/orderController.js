import { Cart, CartItem, Book, Order, OrderItem } from "../models/index.js";
import { sequelize } from "../config/database.js";

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { fullName, phone, address, city, paymentMethod } = req.body;

    // 1. Fetch user's cart with books
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Book],
        },
      ],
      transaction,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2. Validate stock and calculate totals securely
    let subtotal = 0;
    for (const item of cart.CartItems) {
      const book = item.Book;
      if (book.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}". Only ${book.stock} left.`,
        });
      }

      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);

      subtotal += effectivePrice * item.quantity;
    }

    const deliveryFee = subtotal >= 1000 ? 0 : 100;
    const grandTotal = subtotal + deliveryFee;

    // 3. Create the Order
    const order = await Order.create(
      {
        userId,
        totalAmount: subtotal,
        deliveryFee,
        grandTotal,
        fullName,
        phone,
        address,
        city,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        orderStatus: "Processing",
      },
      { transaction },
    );

    // 4. Create Order Items and update book stock
    for (const item of cart.CartItems) {
      const book = item.Book;
      const effectivePrice =
        book.discountPercentage > 0
          ? Number(book.price) * (1 - book.discountPercentage / 100)
          : Number(book.price);

      await OrderItem.create(
        {
          orderId: order.id,
          bookId: book.id,
          quantity: item.quantity,
          priceAtPurchase: effectivePrice,
        },
        { transaction },
      );

      // Reduce stock
      book.stock -= item.quantity;
      await book.save({ transaction });
    }

    // 5. Clear the cart
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction,
    });

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Order placed successfully!", orderId: order.id });
  } catch (error) {
    await transaction.rollback();
    console.error("Checkout Error:", error);
    res.status(500).json({ message: "Server error during checkout" });
  }
};

// Get user orders history
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Book],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};
