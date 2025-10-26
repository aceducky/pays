import { normalizeError } from "../utils/utils.js";
import LoadingText from "./LoadingText.jsx";
import Pagination from "./Pagination.jsx";
import PaymentCard from "./PaymentCard.jsx";

export default function PaymentsList({
  payments = [],
  isLoading = false,
  isError = false,
  error = null,
  pageCount = 1,
  currentPage = 1,
  isFetching = false,
  showPagination = true,
  onPageChange,
}) {
  if (isLoading) return <LoadingText />;

  if (isError) {
    return <div className="alert alert-error">{normalizeError(error)}</div>;
  }

  if (payments.length === 0) {
    return <div className="alert alert-info">No payments found.</div>;
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {payments.map((payment) => (
        <PaymentCard key={payment.paymentId} payment={payment} />
      ))}
    
      <Pagination
        showPagination={showPagination}
        totalPages={pageCount}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isFetching={isFetching}
      />
    </div>
  );
}