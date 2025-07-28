import { Navigate } from "react-router";
import Loading from "@/src/components/Loading";
import { useAuth } from "./useAuth";

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
