import { Navigate } from "react-router";
import { useAuth } from "./auth";
import Loading from "@/src/components/Loading";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
