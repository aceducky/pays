import { useAuth } from "../auth/hooks/useAuth.js";

export default function Dashboard() {
  const { logoutAsync } = useAuth();
  return (
    <>
      <button onClick={logoutAsync} className="btn btn-error">
        Logout
      </button>
    </>
  );
}
