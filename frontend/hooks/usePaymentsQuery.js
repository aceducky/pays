import { useQuery } from "@tanstack/react-query";
import { api } from "../src/api/api.js";

export const PAYMENTS_QUERY_KEY = (params) => ["payments", params];

export function usePaymentsQuery({ page = 1, type = "", sort = "desc", skip, limit } = {}) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEY({ page, type, sort, skip, limit }),
    queryFn: async () => {
      const res = await api.get("/payments", {
        params: { page, type, sort, skip, limit },
      });
      return res.data.data;
    },
    keepPreviousData: true,
  });
}
