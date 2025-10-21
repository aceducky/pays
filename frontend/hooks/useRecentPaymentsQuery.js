import { useQuery } from "@tanstack/react-query";
import { api } from "../src/api/api.js";

export function useRecentPaymentsQuery(username = "") {
  return useQuery({
    queryKey: ["recent-payments", username],
    queryFn: async () => {
      const params = { page: 1, limit: 10 };
      if (username) params.username = username;
      const res = await api.get("/payments", { params });
      return res.data.data.payments;
    },
    staleTime: 60 * 1000,
  });
}
