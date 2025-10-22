import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleX } from "lucide-react";
import { api } from "../api/api.js";
import { USERS_BULK_QUERY_KEY } from "../auth/queryClient.jsx";
import { normalizeError } from "../utils/utils.js";
import LoadingText from "./LoadingText.jsx";

export default function UserBulkSearch() {
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [searchRequested, setSearchRequested] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!searchRequested && filter === "" && page === 1) {
      setSearchRequested(true);
    }
  }, [filter, page, searchRequested]);

  useEffect(() => {
    if (!searchRequested) return;
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [filter, searchRequested]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [USERS_BULK_QUERY_KEY, { filter: debouncedFilter, page }],
    queryFn: async () => {
      const { data } = await api.get("/user/bulk", {
        params: { filter: debouncedFilter, page, limit: 5 },
      });
      return data.data;
    },
    keepPreviousData: true,
    enabled: searchRequested,
  });

  const users = data?.users || [];
  const { page: currentPage = 1, pages: totalPages = 1 } =
    data?.pagination || {};

  const handleSearch = () => {
    setPage(1);
    setSearchRequested(true);
    setDebouncedFilter(filter);
    refetch();
  };
  const handlePay = (userName)=>{
    console.log("Yet to be implemented",userName)
  }
  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Search users</h3>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex gap-2 w-full">
        <label className="input w-full focus-within:outline-none">
          @
          <input
            className="w-full focus-within:outline-none"
            placeholder="Search users by username..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={isFetching}
        >
          {isFetching && <span className="loading loading-spinner"></span>}
          Search
        </button>
      </div>

      {/* Loading / Error states */}
      {isLoading && <LoadingText />}
      {isError && (
        <div className="alert alert-error">
          <CircleX />
          {normalizeError(error)}
        </div>
      )}

      {/* User list */}
      {!isLoading && !isError && searchRequested && (
        <div className="flex flex-col gap-4 mb-6">
          {users.length === 0 && (
            <div className="alert alert-info">No users found.</div>
          )}

          {users.map((user) => (
            <div
              key={user.userName}
              className="card bg-base-200 shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="flex-1">
                <div className="font-semibold text-lg">{user.fullName}</div>
                <div className="text-base-content/70 text-sm">
                  @{user.userName}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handlePay(user.userName)}
              >
                Pay
              </button>
            </div>
          ))}

          {/* Pagination (PaymentsList style) */}
          {totalPages > 1 && (
            <div className="join flex justify-center mt-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`join-item btn btn-sm ${
                    currentPage === i + 1 ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setPage(i + 1)}
                  disabled={isFetching}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
