import { useQuery } from "@tanstack/react-query";
import { api } from "../src/api/api.js";

export const PAYMENTS_SEARCH_QUERY_KEY = (params) => ["payments-search", params];

export function usePaymentsSearchQuery({ page = 1, limit = 10, sort = "desc", username = "" } = {}) {
  return useQuery({
    queryKey: PAYMENTS_SEARCH_QUERY_KEY({ page, limit, sort, username }),
    queryFn: async () => {
      const params = { page, limit, sort };
      if (username) params.username = username;
      const res = await api.get("/payments", { params });
      return res.data.data;
    },
    keepPreviousData: true,
  });
}
