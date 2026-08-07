import Author from "../models/Author.js";

export const AuthorService = {
  getAllAuthors: async () => {
    return await Author.findAll();
  },

  getAuthorById: async (id) => {
    return await Author.findByPk(id);
  },

  createAuthor: async (data) => {
    return await Author.create(data);
  },

  updateAuthor: async (id, data) => {
    const author = await Author.findByPk(id);
    if (!author) return null;
    return await author.update(data);
  },

  deleteAuthor: async (id) => {
    const author = await Author.findByPk(id);
    if (!author) return null;
    await author.destroy();
    return true;
  },
};
