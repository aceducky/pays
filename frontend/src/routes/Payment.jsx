import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleX, ArrowLeft } from "lucide-react";
import TextField from "../components/TextField.jsx";
import { normalizeError } from "../utils/utils.js";
import { usePaymentMutation } from "../hooks/usePaymentMutation.js";
import { paymentSchema } from "../../../shared/zodSchemas/index.js";

export default function Payment() {
  "use no memo";
  const location = useLocation();
  const navigate = useNavigate();
  const receiverUserName = location.state?.receiverUserName;

  const { paymentMutationAsync, isPending, paymentError } =
    usePaymentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiverUserName: receiverUserName,
      amountStr: "",
      description: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  if (!receiverUserName) {
    toast.error("Please select a user from search first");
    navigate("/dashboard");
    return null;
  }

  const onSubmit = async (data) => {
    try {
      await paymentMutationAsync({
        receiverUserName,
        amountStr: data.amountStr,
        description: data.description,
      });
      toast.success("Payment sent successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(normalizeError(err));
    }
  };

  return (
    <main className="h-full flex items-center justify-center bg-base-100">
      <div className="w-full max-w-md bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
        <div className="flex items-center gap-3 mb-6 self-start">
          <button
            onClick={() => navigate(-1)}
            disabled={isPending}
            className="p-2 rounded-full hover:bg-base-300 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold">Send Payment</h2>
        </div>

        <div className="bg-base-300 rounded-lg p-3 mb-5 self-start">
          <div className="text-sm text-base-content/70">Sending to:</div>
          <div className="font-bold text-lg">@{receiverUserName}</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <TextField
              label="Amount $"
              name="amountStr"
              type="text"
              hint="Enter the amount to send"
              error={errors.amountStr}
              placeholder="1.00"
              disabled={isPending}
              registration={register("amountStr")}
            />
          </div>

          <div>
            <TextField
              label="Description (optional)"
              name="description"
              type="text"
              hint="Add a short note"
              error={errors.description}
              placeholder="For dinner, tickets, etc."
              disabled={isPending}
              registration={register("description")}
            />
          </div>

          {paymentError && (
            <div className="alert alert-error flex items-center gap-2">
              <CircleX size={18} />
              <span>{normalizeError(paymentError)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-accent w-full py-3 mt-4 text-lg font-semibold hover:shadow-lg transition"
          >
            {isPending ? "Processing..." : "Send Payment"}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          <Link className="underline opacity-70 hover:text-accent hover:opacity-100 " to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
