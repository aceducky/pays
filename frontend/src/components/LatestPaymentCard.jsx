import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";
import LoadingText from "./LoadingText.jsx";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function LatestPaymentCard() {
  const { data, isPending } = usePaymentsQuery({ limit: 1 });

  if (isPending) return <LoadingText />;

  const latest = data?.payments?.[0];

  const copyPaymentLink = async () => {
    if (!latest) return;

    const origin = globalThis.location.origin;
    const urlToCopy = `${origin}/payments/${latest.paymentId}`;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success("Payment link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error(err);
    }
  };

  return (
    <div className="relative group bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between min-h-40">
      {latest && (
        <button
          type="button"
          onClick={copyPaymentLink}
          aria-label="Copy payment link"
          title="Copy payment link"
          className="absolute top-3 right-3 p-2 rounded-md bg-white/10 backdrop-blur-sm opacity-0 transform translate-y-0 group-hover:opacity-100 group-hover:translate-y-0 transition-opacity duration-200 hover:bg-white/20 hover:cursor-pointer z-10"
        >
          <Copy size={16} />
        </button>
      )}

      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">
          Latest transaction
        </h3>
        {latest ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">
              {latest.isSender ? "Sent" : "Received:"} @{latest.otherUserName}
            </span>
            <span className="text-white/90">{latest.otherFullName}</span>
            <span className="text-white/80 text-lg">{latest.amount}</span>
          </div>
        ) : (
          <p className="text-white/80 text-sm">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
