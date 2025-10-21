import { useAuth } from "../auth/hooks/useAuth.js";
import UserSearchDashboard from "../components/UserSearchDashboard.jsx";
import { useRecentPaymentsQuery } from "../../hooks/useRecentPaymentsQuery.js";
import PaymentsList from "../components/PaymentsList.jsx";
import { Link } from "react-router";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useRecentPaymentsQuery();

  return (
    <div className="min-h-screen overflow-hidden grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-3 gap-4 md:gap-8">
      {/* Main Content */}
      <div className="order-2 md:order-1 md:col-span-2 flex flex-col gap-4 h-[70vh] md:h-[80vh]">
        {/* Recent Activity Box */}
        <div className="bg-base-100 rounded-box shadow-lg p-4 md:p-8 flex flex-col h-2/3 min-h-[260px]">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link to="/payments" className="btn btn-link btn-sm px-0">
              View all payments
            </Link>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            <PaymentsList
              payments={data || []}
              isLoading={isLoading}
              isError={isError}
              error={error}
              pageCount={1}
              currentPage={1}
              onPageChange={() => {}}
              isFetching={false}
              onUsernameClick={() => {}}
              onPaymentClick={() => {}}
              emptyText="No recent payments found."
            />
          </div>
        </div>
        {/* User Search Box, takes remaining vertical space */}
        <div className="flex-1 min-h-[180px]">
          <UserSearchDashboard className="h-full" />
        </div>
      </div>
      {/* Balance card: always at top on mobile, right sidebar on desktop */}
      <div className="order-1 md:order-2 md:col-span-1 flex flex-col gap-4 md:gap-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Balance</h3>
          <p className="text-3xl font-bold mb-2">{user.balance}</p>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">@{user.userName}</span>
            <span className="text-base-content/80 text-sm">{user.fullName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
