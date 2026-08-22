import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/wishlist`;

const WishlistService = {
  getWishlist: async () => {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  toggleWishlist: async (bookId) => {
    const token = sessionStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/toggle`,
      { bookId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },
};

export default WishlistService;
