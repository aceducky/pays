import { CircleX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { USERS_BULK_QUERY_KEY } from "../auth/queryClient.jsx";
import { normalizeError } from "../utils/utils.js";
import LoadingText from "./LoadingText.jsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  paymentAmountStrSchema,
  paymentDescriptionSchema,
} from "../../../shared/zodSchemas/payment.zodSchema.js";
import { toast } from "sonner";

const paymentFormSchema = z.object({
  amountStr: paymentAmountStrSchema,
  description: paymentDescriptionSchema.optional(),
});

function PaymentModal({ open, onClose, receiverUserName }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amountStr: "", description: "" },
  });

  const mutation = useMutation({
    mutationKey: ["pay-user", receiverUserName],
    mutationFn: async (data) => {
      const res = await api.post("/payments", {
        receiverUserName,
        ...data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment sent!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Payment failed");
    },
  });

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Send Payment</h2>
          <button
            type="button"
            className="btn btn-ghost btn-circle text-xl"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mb-4">
          To: <span className="font-semibold">@{receiverUserName}</span>
        </div>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <div className="form-control mb-3">
            <label className="label font-semibold">Amount</label>
            <input
              className="input input-bordered"
              {...register("amountStr")}
              placeholder="10.00"
              inputMode="decimal"
              autoFocus
              disabled={mutation.isPending}
            />
            {errors.amountStr && (
              <span className="text-error text-xs mt-1">
                {errors.amountStr.message}
              </span>
            )}
          </div>
          <div className="form-control mb-3">
            <label className="label font-semibold">Description</label>
            <input
              className="input input-bordered"
              {...register("description")}
              placeholder="(optional)"
              disabled={mutation.isPending}
            />
            {errors.description && (
              <span className="text-error text-xs mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
          <button
            className="btn btn-primary w-full mt-2"
            type="submit"
            disabled={mutation.isPending}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserBulkSearch() {
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [payUser, setPayUser] = useState(null);
  const [searchRequested, setSearchRequested] = useState(false);
  const debounceTimeout = useRef();

  // Show users on first load if filter is empty and page is 1
  useEffect(() => {
    if (!searchRequested && filter === "" && page === 1) {
      setSearchRequested(true);
    }
  }, [searchRequested, filter, page]);

  // Debounce filter input
  useEffect(() => {
    if (!searchRequested) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [filter, searchRequested]);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [USERS_BULK_QUERY_KEY, { filter: debouncedFilter, page }],
    queryFn: async () => {
      const res = await api.get("/user/bulk", {
        params: { filter: debouncedFilter, page, limit: 5 },
      });
      return res.data.data;
    },
    keepPreviousData: true,
    enabled: searchRequested || (filter === "" && page === 1),
  });

  const pageCount = data?.pagination?.pages || 1;
  const currentPage = data?.pagination?.page || 1;

  const handleSearch = () => {
    setPage(1);
    setSearchRequested(true);
    setDebouncedFilter(filter); // immediate search
    refetch();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex gap-2">
        <input
          className="input input-bordered w-full"
          placeholder="Search users by username..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={isFetching}
        >
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
      {searchRequested && !isLoading && !isError && (
        <div className="relative">
          <div
            className="flex flex-col gap-4 overflow-y-auto"
            style={{ maxHeight: 320, paddingBottom: pageCount > 1 ? 56 : 0 }}
          >
            {data.users.length === 0 && (
              <div className="alert alert-info">No users found.</div>
            )}
            {data.users.map((user) => (
              <div
                key={user.userName}
                className="card bg-base-100 shadow flex-row items-center p-4 justify-between"
              >
                <div>
                  <div className="font-semibold text-lg">{user.fullName}</div>
                  <div className="text-base-content/70">@{user.userName}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPayUser(user.userName)}
                >
                  Pay
                </button>
              </div>
            ))}
          </div>
          {/* Sticky Pagination at bottom */}
          {pageCount > 1 && (
            <div className="join flex justify-center sticky left-0 right-0 bottom-0 bg-base-100/80 backdrop-blur border-t border-base-200 py-2 z-10" style={{ minHeight: 48, top: 'auto' }}>
              {Array.from({ length: pageCount }).map((_, i) => (
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
      <PaymentModal
        open={!!payUser}
        onClose={() => setPayUser(null)}
        receiverUserName={payUser}
      />
    </div>
  );
}
