import { GenreService } from "../services/genreService.js";

export const getAllGenres = async (req, res, next) => {
  try {
    const genres = await GenreService.getAllGenres();
    res.status(200).json(genres);
  } catch (err) {
    next(err);
  }
};

export const getGenreById = async (req, res, next) => {
  try {
    const genre = await GenreService.getGenreById(req.params.id);
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.status(200).json(genre);
  } catch (err) {
    next(err);
  }
};

export const createGenre = async (req, res, next) => {
  try {
    const newGenre = await GenreService.createGenre(req.body);
    res.status(201).json(newGenre);
  } catch (err) {
    next(err);
  }
};

export const updateGenre = async (req, res, next) => {
  try {
    const updatedGenre = await GenreService.updateGenre(
      req.params.id,
      req.body,
    );
    if (!updatedGenre)
      return res.status(404).json({ message: "Genre not found" });
    res.status(200).json(updatedGenre);
  } catch (err) {
    next(err);
  }
};

export const deleteGenre = async (req, res, next) => {
  try {
    const deleted = await GenreService.deleteGenre(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Genre not found" });
    res.status(200).json({ message: "Genre deleted successfully" });
  } catch (err) {
    next(err);
  }
};
