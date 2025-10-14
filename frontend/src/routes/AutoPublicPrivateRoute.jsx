import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/hooks/useAuth.js";
import Loading from "../components/Loading.jsx";
import { checkIsPublicRoute } from "./routeConfig.js";

export const AutoPublicProtectedRoute = () => {
  const { pathname } = useLocation();
  const { user, isUserLoading } = useAuth();

  if (isUserLoading) return <Loading />;

  const isPublicRoute = checkIsPublicRoute(pathname);
  
  if (isPublicRoute && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isPublicRoute && !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
