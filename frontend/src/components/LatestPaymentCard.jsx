import { Link } from "react-router";
import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";
import LoadingText from "./LoadingText.jsx";

export default function LatestPaymentCard() {
  const { data, isPending } = usePaymentsQuery({ limit: 1 });

  if (isPending) return <LoadingText />;

  const latest = data?.payments?.[0];

  return (
    <div className="relative group bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between min-h-40">
      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">
          Latest transaction
        </h3>
        {latest ? (
          <Link className="flex flex-col gap-0.5" to={`/payments/${latest.paymentId}`}>
            <span className="text-base font-semibold">
              {latest.isSender ? "Sent" : "Received:"} @{latest.otherUserName}
            </span>
            <span className="text-white/90">{latest.otherFullName}</span>
            <span className="text-white/80 text-lg">{latest.amount}</span>
          </Link>
        ) : (
          <p className="text-white/80 text-sm">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
