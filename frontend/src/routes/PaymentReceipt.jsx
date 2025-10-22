
import { useParams } from "react-router";
import { usePaymentReceiptQuery } from "../hooks/usePaymentReceiptQuery.js";
import LoadingText from "../components/LoadingText.jsx";

export default function PaymentReceipt() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = usePaymentReceiptQuery(id);

  if (isLoading) return <LoadingText />;
  if (isError) return <div className="alert alert-error">{error?.message || "Failed to load payment receipt"}</div>;
  if (!data) return <div className="alert alert-info">No payment found.</div>;

  return (
    <div className="max-w-md mx-auto bg-base-100 rounded-box shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Payment Receipt</h2>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <span className="font-semibold">From:</span>
          <span>@{data.senderUserName} <span className="text-base-content/60">({data.senderFullNameSnapshot})</span></span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">To:</span>
          <span>@{data.receiverUserName} <span className="text-base-content/60">({data.receiverFullNameSnapshot})</span></span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Amount:</span>
          <span className="text-success font-bold">${data.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Description:</span>
          <span>{data.description || <span className="text-base-content/50">(none)</span>}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Date:</span>
          <span>{new Date(data.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
