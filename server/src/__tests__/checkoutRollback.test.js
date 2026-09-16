import { sequelize } from "../config/database.js";
import { OrderService } from "../services/OrderService.js";
import { User, Book, Cart, CartItem } from "../models/index.js";

describe("Checkout Transaction Rollback", () => {
  let customer, book, cart, cartItem;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    customer = await User.create({
      username: "Test",
      email: "test@test.com",
      password: "pwd",
    });
    book = await Book.create({
      title: "Rollback Book",
      price: 500,
      stock: 10,
      authorId: 1,
      genreId: 1,
      sellerId: 1,
    });
    cart = await Cart.create({ userId: customer.id });
    cartItem = await CartItem.create({
      cartId: cart.id,
      bookId: book.id,
      quantity: 2,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should rollback completely if order creation fails", async () => {
    const payload = {
      cartItemIds: [cartItem.id],
      paymentMethod: "COD",
      // Purposely omitting required fields like "fullName" or "address" to force a DB validation crash
    };

    try {
      await OrderService.checkout(customer.id, payload);
    } catch (error) {
      // Expected to fail
    }

    // 🔥 VERIFY THE ROLLBACK WORKED
    // 1. Stock should NOT be deducted
    const unchangedBook = await Book.findByPk(book.id);
    expect(unchangedBook.stock).toBe(10);

    // 2. Cart items should NOT be deleted
    const unchangedCart = await CartItem.findByPk(cartItem.id);
    expect(unchangedCart).not.toBeNull();
  });
});
