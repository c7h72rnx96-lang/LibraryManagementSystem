import Book from "../models/Book.js";
import Author from "../models/Author.js";
import Genre from "../models/Genre.js";
import Review from "../models/Review.js"; // <-- NEW
import User from "../models/User.js"; // <-- NEW
import { Op } from "sequelize";

export const BookService = {
  getAllBooks: async (search = "", genreId = "") => {
    const whereClause = {};

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
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
    });
  },

  // UPGRADED: Now fetches Reviews and the User who wrote them!
  getBookById: async (id) => {
    return await Book.findByPk(id, {
      include: [
        Author,
        Genre,
        {
          model: Review,
          include: [{ model: User, attributes: ["username", "avatar"] }],
          order: [["createdAt", "DESC"]], // Newest reviews first
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
