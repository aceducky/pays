import { Link } from "react-router";

export default function PaymentCard({ payment }) {
  return (
    <Link
      to={`/payments/${payment.paymentId}`}
      className="card bg-base-200 shadow p-4 hover:bg-base-300 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg">
            <span className="text-base-content/70">
              {payment.isSender ? "To " : "From "}
            </span>
            <span>@{payment.otherUserName}</span>
          </div>
          {payment.description && (
            <div className="text-base-content/70 text-sm wrap-break-word">
              {payment.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="font-bold text-lg whitespace-nowrap">
            {payment.amount}
          </div>
          
          <div className="text-xs text-base-content whitespace-nowrap">
            {new Date(payment.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  );
}