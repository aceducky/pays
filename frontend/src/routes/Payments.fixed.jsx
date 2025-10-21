import React from "react";
import { usePaymentsQuery } from "../../hooks/usePaymentsQuery.js";
import { useSearchParams } from "react-router";

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "desc";

  const { data, isLoading, isError, error, isFetching } = usePaymentsQuery({ page, limit, sort });
  const payments = data?.payments || [];
  const pageCount = data?.pagination?.pages || 1;
  const currentPage = data?.pagination?.page || 1;

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage);
      return params;
    });
  };

  const handleLimitChange = (e) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("limit", e.target.value);
      params.set("page", 1);
      return params;
    });
  };

  const handleSortChange = (e) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("sort", e.target.value);
      params.set("page", 1);
      return params;
    });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow p-8 min-h-[400px]">
      <div className="flex flex-wrap gap-4 items-center mb-4 justify-between">
        <h2 className="text-xl font-bold">Payments</h2>
        <div className="flex gap-2 items-center">
          <label className="label">Sort:</label>
          <select className="select select-bordered select-sm" value={sort} onChange={handleSortChange}>
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
          <label className="label">Page size:</label>
          <select className="select select-bordered select-sm" value={limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="text-base-content/70">Loading...</div>
      ) : isError ? (
        <div className="alert alert-error">{error?.message || "Failed to load payments"}</div>
      ) : (
        <>
          {payments.length === 0 ? (
            <div className="alert alert-info">No payments found.</div>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {payments.map((p) => (
                <div key={p.paymentId} className="card bg-base-200 shadow flex-row items-center p-4 justify-between">
                  <div>
                    <div className="font-semibold text-lg">
                      {p.senderUserName ? (
                        <>
                          <span className="text-base-content/70">To </span>@{p.receiverUserName}
                        </>
                      ) : (
                        <>
                          <span className="text-base-content/70">From </span>@{p.senderUserName}
                        </>
                      )}
                    </div>
                    <div className="text-base-content/70 text-sm">{p.description}</div>
                  </div>
                  <div className="font-bold text-lg">${p.amount}</div>
                  <div className="text-xs text-base-content/50">{new Date(p.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          {pageCount > 1 && (
            <div className="join flex justify-center">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`join-item btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => handlePageChange(i + 1)}
                  disabled={isFetching}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
