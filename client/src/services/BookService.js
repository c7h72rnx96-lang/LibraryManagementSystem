// === src/services/BookService.js (Frontend) ===
import axiosInstance from "../utils/axiosInstance.js";

const BookService = {
  // 🔥 UPGRADED: Passes page and limit to the backend
  getAll: async (search = "", genre = "", page = 1, limit = 12) => {
    const response = await axiosInstance.get("/books", {
      params: { search, genre, page, limit },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/books/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/books", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/books/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/books/${id}`);
    return response.data;
  },

  deleteBulk: async (ids) => {
    const response = await axiosInstance.delete("/books/bulk", {
      data: { ids },
    });
    return response.data;
  },
};

export default BookService;
