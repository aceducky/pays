import { useQuery } from "@tanstack/react-query";
import { USERS_BULK_QUERY_KEY } from "../auth/queryClient.jsx";
import { api } from "../api/api.js";

export const useUserBulkSearch = () => {
  return useQuery({
    queryKey: USERS_BULK_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get("/user/bulk");
      console.log(res);
      return res.data.data;
    },
    select: (data) => ({
      users: data?.users || [],
      pagination: data?.pagination || {},
    }),
  });
};
