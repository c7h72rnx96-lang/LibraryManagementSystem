import { fetchAPI } from "../utils/api.js";

const GenreService = {
  getAll: () => fetchAPI("/genres"),

  create: (data) =>
    fetchAPI("/genres", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchAPI(`/genres/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchAPI(`/genres/${id}`, {
      method: "DELETE",
    }),
};

export default GenreService;
