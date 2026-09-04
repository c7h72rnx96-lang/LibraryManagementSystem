// === src/models/index.js ===
import User from "./User.js";
import Author from "./Author.js";
import Genre from "./Genre.js";
import Book from "./Book.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Review from "./Review.js";
import Wishlist from "./Wishlist.js";
import Coupon from "./Coupon.js";
import Payout from "./Payout.js";
import AuditLog from "./AuditLog.js";
import SupportTicket from "./SupportTicket.js";
import SupportMessage from "./SupportMessage.js";
import Conversation from "./Conversation.js";
import ChatMessage from "./ChatMessage.js";

// --- COUPON RELATIONSHIPS ---
User.hasMany(Coupon, { foreignKey: "sellerId", as: "storeCoupons" });
Coupon.belongsTo(User, { foreignKey: "sellerId", as: "store" });

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

// --- MULTI-VENDOR / COMMISSION RELATIONSHIPS ---
User.hasMany(Book, { foreignKey: "sellerId", as: "books" });
Book.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

User.hasMany(OrderItem, { foreignKey: "sellerId" });
OrderItem.belongsTo(User, { foreignKey: "sellerId", as: "Seller" });

// --- PAYOUT & AUDIT RELATIONSHIPS ---
User.hasMany(Payout, { foreignKey: "sellerId" });
Payout.belongsTo(User, { foreignKey: "sellerId", as: "Seller" });

User.hasMany(AuditLog, { foreignKey: "adminId" });
AuditLog.belongsTo(User, { foreignKey: "adminId", as: "Admin" });

// ==========================================
// FORMAL SUPPORT TICKET RELATIONSHIPS
// ==========================================
User.hasMany(SupportTicket, { foreignKey: "userId", as: "MyTickets" });
SupportTicket.belongsTo(User, { foreignKey: "userId", as: "Customer" });

User.hasMany(SupportTicket, { foreignKey: "sellerId", as: "StoreTickets" });
SupportTicket.belongsTo(User, { foreignKey: "sellerId", as: "Seller" });

Order.hasMany(SupportTicket, { foreignKey: "orderId" });
SupportTicket.belongsTo(Order, { foreignKey: "orderId" });

SupportTicket.hasMany(SupportMessage, {
  foreignKey: "ticketId",
  as: "Messages",
  onDelete: "CASCADE",
});
SupportMessage.belongsTo(SupportTicket, { foreignKey: "ticketId" });

User.hasMany(SupportMessage, { foreignKey: "senderId" });
SupportMessage.belongsTo(User, { foreignKey: "senderId", as: "Sender" });

// ==========================================
// REAL-TIME CHAT RELATIONSHIPS (WHATSAPP STYLE)
// ==========================================
User.hasMany(Conversation, {
  foreignKey: "participant1Id",
  as: "StartedConversations",
});
User.hasMany(Conversation, {
  foreignKey: "participant2Id",
  as: "ReceivedConversations",
});
Conversation.belongsTo(User, {
  foreignKey: "participant1Id",
  as: "Participant1",
});
Conversation.belongsTo(User, {
  foreignKey: "participant2Id",
  as: "Participant2",
});

Conversation.hasMany(ChatMessage, {
  foreignKey: "conversationId",
  as: "Messages",
  onDelete: "CASCADE",
});
ChatMessage.belongsTo(Conversation, { foreignKey: "conversationId" });
User.hasMany(ChatMessage, { foreignKey: "senderId" });
ChatMessage.belongsTo(User, { foreignKey: "senderId", as: "Sender" });

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
  Coupon,
  Payout,
  AuditLog,
  SupportTicket,
  SupportMessage,
  Conversation,
  ChatMessage,
};
