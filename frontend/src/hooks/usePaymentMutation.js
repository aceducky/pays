import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { PAYMENTS_QUERY_KEY } from "./usePaymentsQuery.js";
import { USER_QUERY_KEY } from "../auth/hooks/useUserQuery.js";

export function usePaymentMutation() {
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post("/payments", paymentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYMENTS_QUERY_KEY(),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY,
      });
    },
  });

  return {
    paymentMutationAsync: paymentMutation.mutateAsync,
    isPending: paymentMutation.isPending,
    paymentError: paymentMutation.error,
  };
}
