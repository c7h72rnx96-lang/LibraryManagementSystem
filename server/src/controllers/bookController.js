// === server/src/controllers/bookController.js ===
import { BookService } from "../services/bookService.js";
import { Book, Author, Genre, Review } from "../models/index.js";

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

//// ==========================================
// CREATE BOOK (Seller & Admin)
// ==========================================
export const createBook = async (req, res, next) => {
  try {
    const seller = req.user;

    if (seller.role === "seller") {
      const tier = seller.subscriptionTier || "free";
      const bookCount = await Book.count({ where: { sellerId: seller.id } });

      const limits = { free: 5, pro: 30, premium: Infinity };
      const maxAllowed = limits[tier] ?? 5;

      if (bookCount >= maxAllowed) {
        return res.status(403).json({
          message: `Your ${tier.toUpperCase()} plan is limited to ${maxAllowed} books. Please upgrade your subscription tier to list more titles.`,
        });
      }
    }

    // 🔥 FIX: If a file is uploaded, use it. Otherwise, check if an external URL was passed!
    const image = req.file ? req.file.path : req.body.imageUrl || null;

    const newBook = await BookService.createBook({
      ...req.body,
      image,
      sellerId: req.user.id,
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
    const book = await BookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.sellerId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied: You do not own this book." });
    }

    const data = { ...req.body };

    // 🔥 FIX: Check for uploaded file OR external URL
    if (req.file) {
      data.image = req.file.path;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
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

// ==========================================
// GET RECOMMENDATIONS
// ==========================================
export const getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const currentBook = await Book.findByPk(id);

    if (!currentBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Find other books in the same genre
    const booksInGenre = await Book.findAll({
      where: { genreId: currentBook.genreId },
      include: ["Author", "Genre"], // Include relationships if you have them configured this way
    });

    // Filter out the current book being viewed, and grab up to 4 recommendations
    const recommendations = booksInGenre
      .filter((book) => book.id !== parseInt(id))
      .slice(0, 4);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

// ==========================================
// BULK CREATE BOOKS VIA CSV (Seller & Admin)
// ==========================================
export const createBulkBooks = async (req, res, next) => {
  try {
    const { books } = req.body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: "No valid book data provided." });
    }

    const processedBooks = [];

    for (const item of books) {
      // 1. Resolve or create Author
      let authorId = item.authorId;
      if (!authorId && item.externalAuthor) {
        let [author] = await Author.findOrCreate({
          where: { name: item.externalAuthor.trim() },
        });
        authorId = author.id;
      }

      // 2. Resolve or create Genre
      let genreId = item.genreId;
      if (!genreId && item.externalGenre) {
        let [genre] = await Genre.findOrCreate({
          where: { name: item.externalGenre.trim() },
        });
        genreId = genre.id;
      }

      processedBooks.push({
        title: item.title,
        description: item.description,
        price: item.price,
        stock: item.stock,
        discountPercentage: item.discountPercentage || 0,
        // 🔥 FIX: Replaced broken via.placeholder.com with placehold.co
        image:
          item.image ||
          "https://placehold.co/400x600/1e293b/ffffff?text=No+Cover",
        authorId: authorId || 1,
        genreId: genreId || 1,
        sellerId: req.user.id,
      });
    }

    const createdBooks = await Book.bulkCreate(processedBooks);

    res.status(201).json({
      message: `${createdBooks.length} books imported successfully!`,
      count: createdBooks.length,
    });
  } catch (error) {
    next(error);
  }
};
// ==========================================
// BULK DELETE BOOKS (Seller & Admin)
// ==========================================
export const deleteBulkBooks = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No book IDs provided for deletion." });
    }

    const deletedCount = await BookService.deleteBulkBooks(
      ids,
      req.user.id,
      req.user.role,
    );

    res
      .status(200)
      .json({ message: `Successfully deleted ${deletedCount} books.` });
  } catch (err) {
    next(err);
  }
};
