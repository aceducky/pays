import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";
import { useSearchParams } from "react-router";
import { useEffect } from "react";
import PaymentsList from "../components/PaymentsList.jsx";

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "desc";

  useEffect(() => {
    const hasPage = searchParams.has("page");
    const hasLimit = searchParams.has("limit");
    const hasSort = searchParams.has("sort");

    if (!hasPage || !hasLimit || !hasSort) {
      const params = new URLSearchParams(searchParams);
      if (!hasPage) params.set("page", "1");
      if (!hasLimit) params.set("limit", "10");
      if (!hasSort) params.set("sort", "desc");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading, isError, error, isFetching } = usePaymentsQuery({
    page,
    limit,
    sort,
  });

  const payments = data?.payments || [];
  const pageCount = data?.pagination?.pages || 1;
  const currentPage = data?.pagination?.page || 1;

  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        params.set(key, value);
      });
      return params;
    });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow p-8 min-h-[400px]">
      <div className="flex flex-wrap gap-4 items-center mb-4 justify-between">
        <h2 className="text-xl font-bold">Payments</h2>

        <div className="flex gap-2 items-center">
          <label className="label">
            Sort:
            <select
              className="select select-sm w-fit text-base-content"
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </label>

          <label className="label">
            Page size:
            <select
              className="select select-sm text-base-content"
              value={limit}
              onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
      </div>

      <PaymentsList
        payments={payments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={(newPage) => updateParams({ page: newPage })}
        isFetching={isFetching}
      />
    </div>
  );
}
