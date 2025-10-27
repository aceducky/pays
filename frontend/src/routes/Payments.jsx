import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";
import { useSearchParams } from "react-router";
import PaymentsList from "../components/PaymentsList.jsx";

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "desc";

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
          <label className="label">Sort:</label>
          <select
            className="select select-sm w-fit"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>

          <label className="label">Page size:</label>
          <select
            className="select select-sm"
            value={limit}
            onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
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
