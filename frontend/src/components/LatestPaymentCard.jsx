import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";

export default function LatestPaymentCard() {
  const { data } = usePaymentsQuery({ limit: 1 });
  const latest = data?.payments?.[0];

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between min-h-[160px]">
      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">
          Latest transaction
        </h3>
        {latest ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">
              {latest.isSender ? "Sent" : "Received:"} @{latest.otherUserName}
            </span>
            <span className="text-white/80 text-lg">{latest.amount}</span>
          </div>
        ) : (
          <p className="text-white/80 text-sm">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
