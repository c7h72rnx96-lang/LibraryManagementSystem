import { AuthorService } from "../services/authorService.js";

export const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await AuthorService.getAllAuthors();
    res.status(200).json(authors);
  } catch (err) {
    next(err);
  }
};

export const getAuthorById = async (req, res, next) => {
  try {
    const author = await AuthorService.getAuthorById(req.params.id);
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.status(200).json(author);
  } catch (err) {
    next(err);
  }
};

export const createAuthor = async (req, res, next) => {
  try {
    const newAuthor = await AuthorService.createAuthor(req.body);
    res.status(201).json(newAuthor);
  } catch (err) {
    next(err);
  }
};

export const updateAuthor = async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorService.updateAuthor(
      req.params.id,
      req.body,
    );
    if (!updatedAuthor)
      return res.status(404).json({ message: "Author not found" });
    res.status(200).json(updatedAuthor);
  } catch (err) {
    next(err);
  }
};

export const deleteAuthor = async (req, res, next) => {
  try {
    const deleted = await AuthorService.deleteAuthor(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Author not found" });
    res.status(200).json({ message: "Author deleted successfully" });
  } catch (err) {
    next(err);
  }
};
