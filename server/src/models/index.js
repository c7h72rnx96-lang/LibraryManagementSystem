import User from "./User.js";
import Author from "./Author.js";
import Genre from "./Genre.js";
import Book from "./Book.js";
import Cart from "./Cart.js"; // <-- NEW
import CartItem from "./CartItem.js"; // <-- NEW

// --- ORIGINAL RELATIONSHIPS ---
Author.hasMany(Book, {
  foreignKey: "authorId",
});

Book.belongsTo(Author, {
  foreignKey: "authorId",
});

Genre.hasMany(Book, {
  foreignKey: "genreId",
});

Book.belongsTo(Genre, {
  foreignKey: "genreId",
});

// --- NEW CART RELATIONSHIPS ---

// 1. A User has one Cart
User.hasOne(Cart, {
  foreignKey: "userId",
});
Cart.belongsTo(User, {
  foreignKey: "userId",
});

// 2. A Cart contains many CartItems
Cart.hasMany(CartItem, {
  foreignKey: "cartId",
});
CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
});

// 3. A CartItem links to one specific Book
Book.hasMany(CartItem, {
  foreignKey: "bookId",
});
CartItem.belongsTo(Book, {
  foreignKey: "bookId",
});

// Make sure to export the new models!
export { User, Author, Genre, Book, Cart, CartItem };
