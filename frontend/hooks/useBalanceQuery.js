import { useQuery } from "@tanstack/react-query";
import { api } from "../src/api/api.js";

export const BALANCE_QUERY_KEY = ["user-balance"];

export function useBalanceQuery() {
  return useQuery({
    queryKey: BALANCE_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get("/user/balance");
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
}
