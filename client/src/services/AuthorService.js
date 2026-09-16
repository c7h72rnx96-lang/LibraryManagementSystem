import axiosInstance from "../utils/axiosInstance.js";

const AuthorService = {
  getAll: async () => {
    const response = await axiosInstance.get("/authors");
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/authors", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/authors/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/authors/${id}`);
    return response.data;
  },
};

export default AuthorService;
