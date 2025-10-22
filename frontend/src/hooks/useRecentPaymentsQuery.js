import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { PAYMENTS_QUERY_KEY } from "./usePaymentsQuery.js";

export function useRecentPaymentsQuery(username = "") {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEY({ username, recent: true }),
    queryFn: async () => {
      const params = { page: 1, limit: 10 };
      if (username) params.username = username;
      const res = await api.get("/payments", { params });
      return res.data.data?.payments || [];
    },
    staleTime: 60 * 1000,
  });
}
