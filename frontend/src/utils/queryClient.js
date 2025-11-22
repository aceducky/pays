import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 9 * 60 * 1000, // 9 minutes
    },
  },
});
