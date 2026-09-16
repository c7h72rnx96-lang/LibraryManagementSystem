import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import BookService from "../../services/BookService.js";

export const useBooksList = (search, genre, page, limit = 12) => {
  return useQuery({
    queryKey: queryKeys.books.list({ search, genre, page, limit }),
    queryFn: () => BookService.getAll(search, genre, page, limit),
  });
};

export const useBookDetails = (id) => {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => BookService.getById(id),
    enabled: !!id, // Only fetch if ID exists
  });
};
