import request from "supertest";
import app from "../app.js";
import { sequelize } from "../config/database.js";
import {
  User,
  Book,
  Cart,
  CartItem,
  Author,
  Genre,
  Coupon,
} from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "test_secret",
  );
};

describe("Checkout Integrity & Concurrency", () => {
  let customer1Token, customer2Token;
  let sharedBook;
  let customer1, customer2;

  beforeAll(async () => {
    // 1. Sync the in-memory test database
    await sequelize.sync({ force: true });
    process.env.JWT_SECRET = "test_secret";

    // 2. Seed dummy structural data
    const author = await Author.create({ name: "Test Author" });
    const genre = await Genre.create({ name: "Test Genre" });
    const seller = await User.create({
      username: "Seller",
      email: "seller@test.com",
      password: "password",
      role: "seller",
    });

    // 3. Create the test customers
    customer1 = await User.create({
      username: "Customer 1",
      email: "c1@test.com",
      password: "password",
      role: "customer",
      isVerified: true,
    });
    customer2 = await User.create({
      username: "Customer 2",
      email: "c2@test.com",
      password: "password",
      role: "customer",
      isVerified: true,
    });

    customer1Token = generateToken(customer1);
    customer2Token = generateToken(customer2);

    // 4. Create a book with exactly 1 in stock
    sharedBook = await Book.create({
      title: "The Last Copy",
      price: 500,
      stock: 1, // CRITICAL: Only 1 available
      authorId: author.id,
      genreId: genre.id,
      sellerId: seller.id,
    });

    // 5. Create a 50% off coupon
    await Coupon.create({
      code: "HALF",
      discountType: "percentage",
      discountValue: 50,
      minOrderAmount: 0,
      isActive: true,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should calculate correct financial totals enforcing backend validation", async () => {
    // Add item to cart
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ bookId: sharedBook.id });

    // Validate coupon
    const couponRes = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ code: "HALF" });

    expect(couponRes.statusCode).toBe(200);
    expect(couponRes.body.discountAmount).toBe(250); // 50% of 500
  });

  it("should prevent negative stock when two users checkout simultaneously (Race Condition Lock)", async () => {
    // Add the exact same book to Customer 2's cart
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${customer2Token}`)
      .send({ bookId: sharedBook.id });

    // Fetch cart item IDs for both users
    const c1Cart = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${customer1Token}`);
    const c2Cart = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${customer2Token}`);

    const c1ItemId = c1Cart.body.CartItems[0].id;
    const c2ItemId = c2Cart.body.CartItems[0].id;

    // Build the checkout payloads
    const payload1 = {
      fullName: "C1",
      phone: "1234567890",
      address: "A",
      city: "B",
      paymentMethod: "COD",
      cartItemIds: [c1ItemId],
    };
    const payload2 = {
      fullName: "C2",
      phone: "0987654321",
      address: "C",
      city: "D",
      paymentMethod: "COD",
      cartItemIds: [c2ItemId],
    };

    // 🔥 FIRE BOTH CHECKOUT REQUESTS AT THE EXACT SAME MILLISECOND
    const [response1, response2] = await Promise.all([
      request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer1Token}`)
        .send(payload1),
      request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer2Token}`)
        .send(payload2),
    ]);

    // One must succeed (201), the other MUST fail with a stock error (400)
    const statusCodes = [response1.statusCode, response2.statusCode].sort();

    expect(statusCodes).toEqual([201, 400]);

    // Verify the database reflects exactly 0 stock, not -1
    const updatedBook = await Book.findByPk(sharedBook.id);
    expect(updatedBook.stock).toBe(0);
  });
});
