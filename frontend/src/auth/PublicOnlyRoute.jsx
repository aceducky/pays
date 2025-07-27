import { useAuth } from "./useAuth";

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return <Loading />;
  }

  if (isAuthenticated) { // public routes are not shown to authenticated users
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}