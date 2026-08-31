// === server/src/services/bookService.js ===
import Book from "../models/Book.js";
import Author from "../models/Author.js";
import Genre from "../models/Genre.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { Op } from "sequelize";

export const BookService = {
  getAllBooks: async (searchParam = "", genreParam = "") => {
    let search = "";
    let genreId = "";

    if (typeof searchParam === "object" && searchParam !== null) {
      search = searchParam.search || searchParam.author || "";
      genreId = searchParam.genre || searchParam.genreId || "";
    } else {
      search = searchParam || "";
      genreId = genreParam || "";
    }

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { "$Author.name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (genreId) {
      whereClause.genreId = genreId;
    }

    return await Book.findAll({
      where: whereClause,
      include: [
        { model: Author, attributes: ["id", "name"] },
        { model: Genre, attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
      subQuery: false,
    });
  },

  getBookById: async (id) => {
    return await Book.findByPk(id, {
      include: [
        Author,
        Genre,
        {
          model: Review,
          include: [{ model: User, attributes: ["username", "avatar"] }],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
  },

  createBook: async (data) => {
    return await Book.create(data);
  },

  updateBook: async (id, data) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    return await book.update(data);
  },

  deleteBook: async (id) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    await book.destroy();
    return true;
  },

  // 🔥 NEW: Bulk Delete from Database
  deleteBulkBooks: async (ids, userId, role) => {
    const whereClause = { id: { [Op.in]: ids } };

    // Security: If the user is a Seller, ONLY allow them to delete books they own
    if (role !== "admin") {
      whereClause.sellerId = userId;
    }

    const deletedCount = await Book.destroy({ where: whereClause });
    return deletedCount;
  },
};
