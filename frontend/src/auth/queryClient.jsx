import { QueryClient } from "@tanstack/react-query";

export const USER_QUERY_KEY = ["user"];
export const USERS_BULK_QUERY_KEY = ["users"];
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 9 * 60 * 1000, // 9 minutes
    },
    retry: false,
  },
});
