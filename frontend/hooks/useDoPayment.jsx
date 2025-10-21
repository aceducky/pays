import { useMutation } from "@tanstack/react-query";
import { api } from "../src/api/api.js";
import { normalizeError } from "../src/utils/utils.js";

export default function useDoPayment() {
  const doPayment = useMutation({
    mutationKey: ["do-payment"],
    mutationFn: async (data) => {
      const res = await api.post("/payments", data);
      return res.data;
    },
    onSuccess: (data) => {
      const payment = data.data?.payment;
      return payment;
    },
    onError: (error) => {
      console.error("Failed to make payment", normalizeError(error));
    },
  });
  return {
    doPaymentAsync: doPayment.mutateAsync,
    isPaymentPending: doPayment.isPending,
    doPaymentError: normalizeError(doPayment.error),
  };
}
