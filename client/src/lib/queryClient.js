import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes before data is considered stale
      cacheTime: 1000 * 60 * 30, // 30 minutes cache retention
      refetchOnWindowFocus: false, // Prevent unnecessary refetches on tab switch
      retry: 1, // Only retry failed requests once
    },
  },
});
