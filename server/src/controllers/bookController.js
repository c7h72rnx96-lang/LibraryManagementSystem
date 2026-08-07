import { BookService } from "../services/bookService.js";

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
    const image = req.file ? req.file.filename : null;

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
      data.image = req.file.filename;
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
