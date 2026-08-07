import { fetchAPI } from "../utils/api.js";

const AuthorService = {
  getAll: () => fetchAPI("/authors"),

  create: (data) =>
    fetchAPI("/authors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchAPI(`/authors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchAPI(`/authors/${id}`, {
      method: "DELETE",
    }),
};

export default AuthorService;
