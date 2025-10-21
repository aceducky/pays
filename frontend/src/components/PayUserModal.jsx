import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { paymentAmountStrSchema, paymentDescriptionSchema } from "../../../shared/zodSchemas/payment.zodSchema.js";
import { USER_QUERY_KEY } from "../auth/queryClient.jsx";
import { BALANCE_QUERY_KEY } from "../../hooks/useBalanceQuery.js";

const paySchema = paymentAmountStrSchema.and(paymentDescriptionSchema.optional());

export default function PayUserModal({ user, open, onClose }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(paySchema),
    defaultValues: { amountStr: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/payments", {
        receiverUserName: user.userName,
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(USER_QUERY_KEY);
      queryClient.invalidateQueries(BALANCE_QUERY_KEY);
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">Pay @{user.userName}</h3>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <label className="label">Amount</label>
          <input className="input input-bordered w-full mb-2" {...register("amountStr")} disabled={isSubmitting} />
          {errors.amountStr && <span className="text-error text-xs">{errors.amountStr.message}</span>}
          <label className="label">Description (optional)</label>
          <input className="input input-bordered w-full mb-2" {...register("description")} disabled={isSubmitting} />
          {errors.description && <span className="text-error text-xs">{errors.description.message}</span>}
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Pay</button>
          </div>
        </form>
      </div>
    </div>
  );
}
