import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";
import { normalizeError } from "../utils/utils.js";
import LoadingText from "./LoadingText.jsx";
import { useNavigate } from "react-router/internal/react-server-client";
import Pagination from "./Pagination.jsx";
import { useUserBulkSearch } from "../hooks/useUserBulkSearch.jsx";
import { useDebounce } from "../hooks/useDebounce.js";

export default function UserBulkSearch() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [searchRequested, setSearchRequested] = useState(false);
  const debouncedFilter = useDebounce(filter, 500);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchRequested && filter === "" && page === 1) {
      setSearchRequested(true);
    }
  }, [filter, page, searchRequested]);

  const { data, isLoading, isFetching, isError, error } = useUserBulkSearch({
    filter: debouncedFilter,
    page,
    limit: 5,
    enabled: searchRequested,
  });

  const users = data?.users || [];
  const { page: currentPage = 1, pages: totalPages = 1 } =
    data?.pagination || {};

  const handleSearch = () => {
    setPage(1);
    setSearchRequested(true);
  };

  const handlePay = (userName) => {
    navigate("/payment", { state: { receiverUserName: userName } });
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Search users</h3>
      </div>

      <div className="mb-4 flex gap-2 w-full">
        <label className="input w-full focus-within:outline-none">
          @
          <input
            autoFocus
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

      {isLoading && <LoadingText />}
      {isError && (
        <div className="alert alert-error">
          <CircleX />
          {normalizeError(error)}
        </div>
      )}

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
                <div className="text-lg">@{user.userName}</div>
                <div className="text-base-content/80 text-sm">
                  {user.fullName}
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            isFetching={isFetching}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}
