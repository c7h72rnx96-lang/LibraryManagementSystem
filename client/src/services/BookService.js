import { fetchAPI } from "../utils/api.js";

const BookService = {
  // We pass search and genreId to filter the books
  getAll: (search = "", genreId = "") => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (genreId) query.append("genreId", genreId);

    return fetchAPI(`/books?${query.toString()}`);
  },

  getById: (id) => fetchAPI(`/books/${id}`),

  // Notice we don't use JSON.stringify here because we are sending a FormData object containing a file
  create: (formData) =>
    fetchAPI("/books", {
      method: "POST",
      body: formData,
    }),

  update: (id, formData) =>
    fetchAPI(`/books/${id}`, {
      method: "PUT",
      body: formData,
    }),

  delete: (id) =>
    fetchAPI(`/books/${id}`, {
      method: "DELETE",
    }),
};

export default BookService;
