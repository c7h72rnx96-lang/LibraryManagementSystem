// === src/services/BookService.js ===
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/books`;

const BookService = {
  getAll: async (search = "", genre = "") => {
    const response = await axios.get(API_URL, {
      params: { search, genre },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const token = sessionStorage.getItem("token");
    const response = await axios.post(API_URL, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const token = sessionStorage.getItem("token");
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const token = sessionStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 🔥 NEW: Bulk Delete Method
  deleteBulk: async (ids) => {
    const token = sessionStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/bulk`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ids }, // Axios requires sending the body inside 'data' for DELETE requests
    });
    return response.data;
  },
};

export default BookService;
