import Genre from "../models/Genre.js";

export const GenreService = {
  getAllGenres: async () => {
    return await Genre.findAll();
  },

  getGenreById: async (id) => {
    return await Genre.findByPk(id);
  },

  createGenre: async (data) => {
    return await Genre.create(data);
  },

  updateGenre: async (id, data) => {
    const genre = await Genre.findByPk(id);
    if (!genre) return null;
    return await genre.update(data);
  },

  deleteGenre: async (id) => {
    const genre = await Genre.findByPk(id);
    if (!genre) return null;
    await genre.destroy();
    return true;
  },
};
