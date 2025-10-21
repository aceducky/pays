import { useQuery } from "@tanstack/react-query";
import { api } from "../src/api/api.js";

export function usePaymentReceiptQuery(paymentId) {
  return useQuery({
    queryKey: ["payment-receipt", paymentId],
    queryFn: async () => {
      const res = await api.get(`/payments/${paymentId}`);
      return res.data.data;
    },
    enabled: !!paymentId,
  });
}
