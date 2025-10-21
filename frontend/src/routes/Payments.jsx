import { usePaymentsSearchQuery } from "../../hooks/usePaymentsSearchQuery.js";
import { useSearchParams, useNavigate } from "react-router";
import PaymentsList from "../components/PaymentsList.jsx";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "../hooks/useDebounce.js";
import { userNameSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import { useBalanceQuery } from "../../hooks/useBalanceQuery.js";
//


export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "desc";

  const urlUsername = searchParams.get("username") || "";
  //


  // React Hook Form for username search
  const {
    register,
    handleSubmit,
    setValue,
    // formState: { errors },
  } = useForm({
    defaultValues: { username: urlUsername },
    resolver: zodResolver(userNameSchema.or(userNameSchema.optional().transform(() => ""))),
  });

  // Debounce username for query, always from url param
  //
  const debouncedUsername = useDebounce(urlUsername, 500);

  // Query
  const { data, isLoading, isError, error, isFetching } = usePaymentsSearchQuery({
    page,
    limit,
    sort,
    username: debouncedUsername,
  });
  const payments = data?.payments || [];
  const pageCount = data?.pagination?.pages || 1;
  const currentPage = data?.pagination?.page || 1;
  const { refetch: refetchBalance } = useBalanceQuery();
  const lastPaymentsRef = useRef();


  // Sync username to URL param only if valid and non-empty
  const onSearch = ({ username }) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (username) {
        params.set("username", username);
      } else {
        params.delete("username");
      }
      params.set("page", 1);
      return params;
    });
  };

  // When username is clicked in payment list
  const handleUsernameClick = (userName) => {
    setValue("username", userName, { shouldValidate: true });
    setTimeout(() => {
      onSearch({ username: userName });
    }, 0);
  };

  // When payment is clicked
  const handlePaymentClick = (paymentId) => {
    navigate(`/payments/${paymentId}`);
  };

  // Refetch balance when payments list changes
  useEffect(() => {
    if (
      lastPaymentsRef.current &&
      lastPaymentsRef.current !== JSON.stringify(payments)
    ) {
      refetchBalance();
    }
    lastPaymentsRef.current = JSON.stringify(payments);
    // intentionally no object in deps
    // eslint-disable-next-line
  }, [payments]);

  // Keep input in sync with URL param (e.g. on back navigation)
  useEffect(() => {
    setValue("username", urlUsername);
  }, [urlUsername, setValue]);

  return (
    <div className="bg-base-100 rounded-2xl shadow p-8 min-h-[400px]">
      <div className="flex flex-wrap gap-4 items-center mb-4 justify-between">
        <h2 className="text-xl font-bold">Payments</h2>
        <form className="flex gap-2 items-center" onSubmit={handleSubmit(onSearch)}>
          <input
            className="input input-bordered input-sm"
            placeholder="Search by username..."
            style={{ minWidth: 180 }}
            {...register("username")}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          <label className="label">Sort:</label>
          <select
            className="select select-bordered select-sm"
            value={sort}
            onChange={e => setSearchParams(prev => {
              const params = new URLSearchParams(prev);
              params.set("sort", e.target.value);
              params.set("page", 1);
              return params;
            })}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
          <label className="label">Page size:</label>
          <select
            className="select select-bordered select-sm"
            value={limit}
            onChange={e => setSearchParams(prev => {
              const params = new URLSearchParams(prev);
              params.set("limit", e.target.value);
              params.set("page", 1);
              return params;
            })}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </form>
      </div>
      <PaymentsList
        payments={payments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={newPage => setSearchParams(prev => {
          const params = new URLSearchParams(prev);
          params.set("page", newPage);
          return params;
        })}
        isFetching={isFetching}
        onUsernameClick={(userName, isSender) => handleUsernameClick(userName, isSender)}
        onPaymentClick={handlePaymentClick}
      />
    </div>
  );
}
