import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useEffect, useRef} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {api} from "../api/api.js";
import {toast} from "sonner";
import {PAYMENTS_QUERY_KEY} from "../hooks/usePaymentsQuery.js";
import {z} from "zod";
import {paymentAmountStrSchema, paymentDescriptionSchema} from "../../../shared/zodSchemas/index.js";
import { X } from "lucide-react";

const paymentFormSchema = z.object({
    amountStr: paymentAmountStrSchema,
    description: paymentDescriptionSchema.optional(),
});

export function PaymentModal({open, onClose, receiverUserName}) {
    const queryClient = useQueryClient();
    const modalRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {amountStr: "", description: ""},
    });

    const mutation = useMutation({
        mutationFn: async (formData) => {
            const {data} = await api.post("/payments", {
                receiverUserName,
                ...formData,
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Payment sent!");
            queryClient.invalidateQueries({queryKey: PAYMENTS_QUERY_KEY()});
            reset();
            onClose();
        },
        onError: (err) => {
            const message = err?.response?.data?.message || "Payment failed";
            toast.error(message);
        },
    });

    useEffect(() => {
        if (!modalRef.current) return;

        if (open) {
            modalRef.current.showModal();
        } else {
            modalRef.current.close();
        }
    }, [open]);

    const handleClose = () => {
        if (!mutation.isPending) {
            onClose();
        }
    };

    const handleESC = (event) => {
        if (mutation.isPending) {
            event.preventDefault();
        } else {
            handleClose();
        }
    };

    return (
        <dialog
            ref={modalRef}
            className="modal"
            onCancel={handleESC}
            onClose={handleClose}
        >
            <div className="modal-box shadow-white shadow-xs">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm absolute right-2 top-2"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                    >
                        <X/>
                    </button>
                </form>

                <h3 className="font-bold text-lg mb-4">Send Payment</h3>

                <div className="mb-4">
                    To: <span className="font-semibold">@{receiverUserName}</span>
                </div>

                <form onSubmit={handleSubmit(mutation.mutate)}>
                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text font-semibold mr-1">Amount: $</span>
                        </label>
                        <input
                            className="input input-bordered focus-within:outline-none"
                            {...register("amountStr")}
                            placeholder="10.00"
                            inputMode="decimal"
                            autoFocus
                            disabled={mutation.isPending}
                        />
                        {errors.amountStr && (
                            <label className="label">
                <span className="label-text-alt text-error text-wrap">
                  {errors.amountStr.message}
                </span>
                            </label>
                        )}
                    </div>

                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text font-semibold mr-2">Description</span>
                        </label>
                        <input
                            className="input input-bordered focus-within:outline-none"
                            {...register("description")}
                            placeholder="(optional)"
                            disabled={mutation.isPending}
                        />
                        {errors.description && (
                            <label className="label">
                <span className="label-text-alt text-error text-wrap">
                  {errors.description.message}
                </span>
                            </label>
                        )}
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={handleClose}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && <span className="loading loading-spinner"></span>}
                            {mutation.isPending ? "Sending..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={mutation.isPending}
                >
                    close
                </button>
            </form>
        </dialog>
    );
}