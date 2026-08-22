import User from "./User.js";
import Author from "./Author.js";
import Genre from "./Genre.js";
import Book from "./Book.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Review from "./Review.js";
import Wishlist from "./Wishlist.js"; // <-- NEW IMPORT

// --- BOOK RELATIONSHIPS ---
Author.hasMany(Book, { foreignKey: "authorId" });
Book.belongsTo(Author, { foreignKey: "authorId" });

Genre.hasMany(Book, { foreignKey: "genreId" });
Book.belongsTo(Genre, { foreignKey: "genreId" });

// --- CART RELATIONSHIPS ---
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

Book.hasMany(CartItem, { foreignKey: "bookId" });
CartItem.belongsTo(Book, { foreignKey: "bookId" });

// --- ORDER RELATIONSHIPS ---
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Book.hasMany(OrderItem, { foreignKey: "bookId" });
OrderItem.belongsTo(Book, { foreignKey: "bookId" });

// --- REVIEW RELATIONSHIPS ---
User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Review, { foreignKey: "bookId" });
Review.belongsTo(Book, { foreignKey: "bookId" });

// --- WISHLIST RELATIONSHIPS ---
User.hasMany(Wishlist, { foreignKey: "userId" });
Wishlist.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Wishlist, { foreignKey: "bookId", onDelete: "CASCADE" });
Wishlist.belongsTo(Book, { foreignKey: "bookId" });

export {
  User,
  Author,
  Genre,
  Book,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
};
