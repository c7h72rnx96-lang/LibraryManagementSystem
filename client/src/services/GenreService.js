import axiosInstance from "../utils/axiosInstance.js";

const GenreService = {
  getAll: async () => {
    const response = await axiosInstance.get("/genres");
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/genres", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/genres/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/genres/${id}`);
    return response.data;
  },
};

export default GenreService;
