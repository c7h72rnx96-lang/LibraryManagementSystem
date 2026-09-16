import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId) => {
      const res = await axiosInstance.post("/cart/add", { bookId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Added to cart!");
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add to cart.");
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      await axiosInstance.put(`/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update quantity");
    },
  });
};

// 🔥 ADDED THE MISSING REMOVE HOOK
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      await axiosInstance.delete(`/cart/${itemId}`);
    },
    onSuccess: () => {
      toast.success("Removed from cart");
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove item");
    },
  });
};
