import { Book, Author, Genre } from "../models/index.js";
import { Op } from "sequelize";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.count();
    const totalAuthors = await Author.count();
    const totalGenres = await Genre.count();

    // Count books where stock is less than 5
    const lowStockBooks = await Book.count({
      where: {
        stock: {
          [Op.lt]: 5,
        },
      },
    });

    res.status(200).json({
      totalBooks,
      totalAuthors,
      totalGenres,
      lowStockBooks,
    });
  } catch (err) {
    next(err);
  }
};
