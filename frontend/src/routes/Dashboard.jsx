import { useAuth } from "../auth/hooks/useAuth.js";
import UserBulkSearch from "../components/UserBulkSearch.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      Dashboard
      {JSON.stringify(user, null, 2)}
      <UserBulkSearch />
    </>
  );
}
