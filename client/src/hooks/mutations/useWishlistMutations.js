import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import WishlistService from "../../services/WishlistService.js";
import toast from "react-hot-toast";

export const useWishlistQuery = (user) => {
  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: () => WishlistService.getWishlist(),
    enabled: !!user, // Only fetch if the user is actually logged in
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId) => {
      return await WishlistService.toggleWishlist(bookId);
    },
    onSuccess: (data) => {
      if (data.added) {
        toast.success("Saved to Wishlist! ❤️");
      } else {
        toast.success("Removed from Wishlist 💔");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update wishlist. Please log in.");
    },
  });
};
