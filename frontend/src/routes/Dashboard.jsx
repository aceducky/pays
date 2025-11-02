import PaymentsList from "../components/PaymentsList.jsx";
import { Link, useNavigate } from "react-router";
import { usePaymentsQuery } from "../hooks/usePaymentsQuery.js";
import BalanceCard from "../components/BalanceCard.jsx";
import LatestPaymentCard from "../components/LatestPaymentCard.jsx";

export default function Dashboard() {
  const { data, isLoading, isError, error } = usePaymentsQuery({ limit: 5 });
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col gap-8 p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        <LatestPaymentCard />
        <BalanceCard />
      </div>

      <div className="flex justify-center">
        <button
          className="btn btn-primary px-8 py-4 text-lg shadow-lg"
          onClick={() => navigate("/users")}
        >
          Make new payment
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 h-[75vh] md:h-[85vh]">
        <div className="bg-base-100 rounded-2xl shadow-lg p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 flex-wrap">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link to="/payments" className="btn btn-link btn-sm px-0">
              View all payments
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <PaymentsList
              payments={data?.payments || []}
              isLoading={isLoading}
              isError={isError}
              error={error}
              showPagination={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
