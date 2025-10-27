import { useAuth } from "../auth/hooks/useAuth.jsx";

export default function BalanceCard() {
  const { user } = useAuth();

  return (
    <div className="bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between min-h-40">
      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">Total Balance</h3>
        <p className="text-3xl font-bold mb-2">{user.balance}</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">@{user.userName}</span>
        <span className="text-sm text-white">
          {user.fullName}
        </span>
      </div>
    </div>
  );
}
