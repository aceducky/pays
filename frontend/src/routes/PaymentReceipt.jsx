import { useParams } from "react-router";
import { usePaymentReceiptQuery } from "../hooks/usePaymentReceiptQuery.js";
import LoadingText from "../components/LoadingText.jsx";
import { toast } from "sonner";
import { normalizeError } from "../utils/utils.js";

export default function PaymentReceipt() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = usePaymentReceiptQuery(id);

  if (isLoading) return <LoadingText />;
  if (isError)
    return <div className="alert alert-error">{normalizeError(error)}</div>;
  if (!data) return <div className="alert alert-info">No payment found.</div>;

  return (
    <>
      <div className="max-w-md mx-auto bg-base-300 rounded-box shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Payment Receipt</h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="font-semibold">Payment id:</span>
            <span>{data.paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">From:</span>
            <span>
              @{data.senderUserName}{" "}
              <span className="text-base-content/60">
                ({data.senderFullNameSnapshot})
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">To:</span>
            <span>
              @{data.receiverUserName}{" "}
              <span className="text-base-content/60">
                ({data.receiverFullNameSnapshot})
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Amount:</span>
            <span className="font-bold">{data.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Description:</span>
            <span>
              {data.description || (
                <span className="text-base-content/50">(none)</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Date:</span>
            <span>{new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="grid place-items-center">
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(globalThis.location);
              toast.success("Link copied");
            } catch {
              console.error("Failed to copy link");
            }
          }}
        >
          Copy link
        </button>
      </div>
    </>
  );
}
