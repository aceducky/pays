import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api.js";

export const PAYMENTS_QUERY_KEY = (params = {}) => ["payments", params];

export function usePaymentsQuery({ page = 1, sort = "desc", limit =10, skip } = {}) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEY({ page, sort, skip, limit }),
    queryFn: async () => {
      const res = await api.get("/payments", {
        params: { page, sort, skip, limit },
      });
      return res.data.data;
    },
    keepPreviousData: true,
  });
}
