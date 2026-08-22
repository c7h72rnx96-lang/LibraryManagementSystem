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

    // SMART EXTRACTION: This handles the data safely whether your
    // controller passes it as a single object (req.query) or as individual strings!
    if (typeof searchParam === "object" && searchParam !== null) {
      search = searchParam.search || searchParam.author || "";
      genreId = searchParam.genre || searchParam.genreId || "";
    } else {
      search = searchParam || "";
      genreId = genreParam || "";
    }

    const whereClause = {};

    // 1. Apply the Search Filter (Titles & Authors)
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { "$Author.name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // 2. Apply the Genre Dropdown Filter
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
      subQuery: false, // <-- CRUCIAL FIX: Prevents Sequelize from breaking when combining filters
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
};
