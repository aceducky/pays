import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/hooks/useAuth.jsx";
import LoadingBars from "../components/LoadingBars.jsx";
import { checkIsPublicRoute } from "./routeConfig.js";
import { Toaster } from "sonner";

export default function AutoPublicProtectedRoute() {
  const { pathname } = useLocation();
  const { user, isUserLoading } = useAuth();

  if (isUserLoading) return <LoadingBars />;
  
  const isPublicRoute = checkIsPublicRoute(pathname);

  if (isPublicRoute && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isPublicRoute && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}
