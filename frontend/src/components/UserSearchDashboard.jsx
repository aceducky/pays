import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api.js";
import LoadingText from "./LoadingText.jsx";

export default function UserSearchDashboard() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["dashboard-user-search", { filter: debouncedQuery, page }],
    queryFn: async () => {
      const res = await api.get("/user/bulk", {
        params: { filter: debouncedQuery, page, limit: 5 },
      });
      return res.data.data;
    },
    enabled: true, // Always enabled to show users by default
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const pageCount = data?.pagination?.pages || 1;
  const currentPage = data?.pagination?.page || 1;


  return (
    <div className="w-full max-w-2xl mx-auto bg-base-100 rounded-2xl shadow p-4 flex flex-col" style={{ height: 340 }}>
      {/* Search bar at top, always visible */}
      <div className="mb-2 flex gap-2">
        <input
          className="input input-bordered w-full"
          placeholder="Search users by username..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {/* Scrollable user list only */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar" style={{ maxHeight: 220 }}>
        {isLoading || isFetching ? (
          <LoadingText />
        ) : isError ? (
          <div className="alert alert-error">{error?.message || "Failed to search users"}</div>
        ) : users.length === 0 ? (
          <div className="alert alert-info">{debouncedQuery.length === 0 ? "No users found." : "No users match your search."}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(user => (
              <div
                key={user.userName}
                className="card bg-base-100 shadow flex-row items-center p-4 justify-between hover:bg-base-200 transition"
              >
                <div>
                  <div className="font-semibold text-lg">{user.fullName}</div>
                  <div className="text-base-content/70">@{user.userName}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                >
                  Pay
                </button>
              </div>
            ))}
            {/* DaisyUI Pay Modal */}
          </div>
        )}
      </div>
      {/* Pagination at bottom, always visible */}
      {pageCount > 1 && (
        <div className="join flex justify-center mt-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`join-item btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setPage(i + 1)}
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