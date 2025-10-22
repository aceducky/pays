import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { PAYMENTS_QUERY_KEY } from "./usePaymentsQuery.js";

export function usePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post("/payments", paymentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYMENTS_QUERY_KEY(),
        exact: false,
      });
    },
  });
}
