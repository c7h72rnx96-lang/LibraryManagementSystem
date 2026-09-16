import axiosInstance from "../utils/axiosInstance.js";

const WishlistService = {
  getWishlist: async () => {
    const response = await axiosInstance.get("/wishlist");
    return response.data;
  },

  toggleWishlist: async (bookId) => {
    const response = await axiosInstance.post("/wishlist/toggle", { bookId });
    return response.data;
  },
};

export default WishlistService;
