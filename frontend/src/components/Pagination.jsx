export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isFetching = false,
  showPagination = true,
  className = "",
}) {
  if (!showPagination || totalPages <= 1) return null;

  return (
    <div className={`join flex justify-center mt-2 ${className}`}>
      {Array.from({ length: totalPages }).map((_, i) => (
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
  );
}