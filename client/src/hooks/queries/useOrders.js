import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import axiosInstance from "../../utils/axiosInstance.js";

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const response = await axiosInstance.get("/orders");
      return response.data;
    },
  });
};
