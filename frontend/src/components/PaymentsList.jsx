import LoadingText from "./LoadingText.jsx";

export default function PaymentsList({
  payments = [],
  isLoading = false,
  isError = false,
  error = null,
  pageCount = 1,
  currentPage = 1,
  onPageChange = () => {},
  isFetching = false,
  showPagination = true,
}) {
  if (isLoading) return <LoadingText />;
  
  if (isError) {
    return (
      <div className="alert alert-error">
        {error?.message || "Failed to load payments"}
      </div>
    );
  }

  if (payments.length === 0) {
    return <div className="alert alert-info">No payments found.</div>;
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {payments.map((p) => (
        <div
          key={p.paymentId}
          className="card bg-base-200 shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
        >
          <div className="flex-1">
            <div className="font-semibold text-lg">
              <span className="text-base-content/70">
                {p.isSender ? "To " : "From "}
              </span>
              <span>@{p.otherUserName}</span>
            </div>
            <div className="text-base-content/70 text-sm break-words">
              {p.description}
            </div>
          </div>
          
          <div className="font-bold text-lg whitespace-nowrap">
            {p.amount}
          </div>
          
          <div className="text-xs text-base-content/60 whitespace-nowrap">
            {new Date(p.timestamp).toLocaleString()}
          </div>
        </div>
      ))}

      {showPagination && pageCount > 1 && (
        <div className="join flex justify-center">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`join-item btn btn-sm ${
                currentPage === i + 1 ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => onPageChange(i + 1)}
              disabled={isFetching}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}