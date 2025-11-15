import { useQuery } from "@tanstack/react-query";
import { USERS_BULK_QUERY_KEY } from "../utils/queryClient.js";
import { api } from "../api/api.js";

export const useUserBulkSearch = ({ filter = "", page = 1, limit = 5, enabled = false }) => {
  return useQuery({
    queryKey: [USERS_BULK_QUERY_KEY, { filter, page }],
    queryFn: async () => {
      const { data } = await api.get("/user/bulk", {
        params: { filter, page, limit },
      });
      return data.data;
    },
    retry:false,
    keepPreviousData: true,
    enabled,
    select: (data) => ({
      users: data?.users || [],
      pagination: {
        page: data?.pagination?.page || 1,
        pages: data?.pagination?.pages || 1,
      },
    }),
  });
};