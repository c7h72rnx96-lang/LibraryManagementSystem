import { BookService } from "../services/bookService.js";
import { Review } from "../models/index.js";

// ==========================================
// GET ALL BOOKS (Public)
// ==========================================
export const getAllBooks = async (req, res, next) => {
  try {
    const { search, genre } = req.query;
    const books = await BookService.getAllBooks(search, genre);
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// GET BOOK BY ID (Public)
// ==========================================
export const getBookById = async (req, res, next) => {
  try {
    const book = await BookService.getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// CREATE BOOK (Seller & Admin)
// ==========================================
export const createBook = async (req, res, next) => {
  try {
    // req.file.path contains the secure Cloudinary image URL
    const image = req.file ? req.file.path : null;

    const newBook = await BookService.createBook({
      ...req.body,
      image,
      sellerId: req.user.id, // 🔥 CRITICAL: Links the book to the logged-in seller!
    });

    res.status(201).json(newBook);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// UPDATE BOOK (Seller & Admin)
// ==========================================
export const updateBook = async (req, res, next) => {
  try {
    // 1. Fetch the book first to check ownership
    const book = await BookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 2. 🔥 AUTHORIZATION CHECK: Only the owner or the Main Admin can edit
    if (book.sellerId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied: You do not own this book." });
    }

    // 3. Process updates
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path; // Update Cloudinary image if a new one is uploaded
    }

    const updatedBook = await BookService.updateBook(req.params.id, data);

    res.status(200).json(updatedBook);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// DELETE BOOK (Seller & Admin)
// ==========================================
export const deleteBook = async (req, res, next) => {
  try {
    // 1. Fetch the book first to check ownership
    const book = await BookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 2. 🔥 AUTHORIZATION CHECK: Only the owner or the Main Admin can delete
    if (book.sellerId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied: You do not own this book." });
    }

    // 3. Delete the book
    await BookService.deleteBook(req.params.id);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// ADD BOOK REVIEW (Logged-in Customers)
// ==========================================
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id; // Comes securely from the token

    // Check if this user already reviewed this book
    const existingReview = await Review.findOne({ where: { userId, bookId } });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book." });
    }

    const review = await Review.create({ rating, comment, bookId, userId });
    res.status(201).json({ message: "Review added successfully!", review });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ message: "Failed to add review." });
  }
};
