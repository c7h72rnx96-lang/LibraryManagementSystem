// === src/services/bookService.js (Backend) ===
import { Book, Author, Genre, Review, User } from "../models/index.js";
import { Op } from "sequelize";

export const BookService = {
  // 🔥 UPGRADED: Now accepts page and limit arguments
  getAllBooks: async (
    searchParam = "",
    genreParam = "",
    sellerIdParam = "",
    page = 1,
    limit = 12,
  ) => {
    let search = searchParam || "";
    let genreId = genreParam || "";
    let sellerId = sellerIdParam || "";

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { "$Author.name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (genreId) whereClause.genreId = genreId;
    if (sellerId) whereClause.sellerId = sellerId;

    const offset = (page - 1) * limit;

    // 🔥 UPGRADED: Uses findAndCountAll to power the pagination UI
    const { rows, count } = await Book.findAndCountAll({
      where: whereClause,
      include: [
        { model: Author, attributes: ["id", "name"] },
        { model: Genre, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]], // Show newest books first!
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    return {
      books: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
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

  deleteBulkBooks: async (ids, userId, role) => {
    const whereClause = { id: { [Op.in]: ids } };
    if (role !== "admin") {
      whereClause.sellerId = userId;
    }
    const deletedCount = await Book.destroy({ where: whereClause });
    return deletedCount;
  },
};
