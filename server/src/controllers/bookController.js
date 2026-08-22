import { BookService } from "../services/bookService.js";
import { Review } from "../models/index.js";
export const getAllBooks = async (req, res, next) => {
  try {
    const { search, genreId } = req.query;

    const books = await BookService.getAllBooks(search, genreId);

    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await BookService.getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    // req.file.path contains the secure Cloudinary image URL
    const image = req.file ? req.file.path : null;

    const newBook = await BookService.createBook({
      ...req.body,
      image,
    });

    res.status(201).json(newBook);
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    if (req.file) {
      // req.file.path contains the secure Cloudinary image URL
      data.image = req.file.path;
    }

    const updatedBook = await BookService.updateBook(req.params.id, data);

    if (!updatedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(updatedBook);
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const deleted = await BookService.deleteBook(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
// ==========================================
// ADD BOOK REVIEW
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
    console.error(err);
    res.status(500).json({ message: "Failed to add review." });
  }
};
