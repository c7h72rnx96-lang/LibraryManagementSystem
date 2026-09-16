import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import axiosInstance from "../../utils/axiosInstance.js";

export const useCartQuery = () => {
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const response = await axiosInstance.get("/cart");
      return response.data.CartItems || [];
    },
  });
};
