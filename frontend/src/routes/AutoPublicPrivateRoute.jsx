import { useLocation } from "react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { PublicOnlyRoute } from "../auth/PublicOnlyRoute";
import { isPublicRoute } from "./routeConfig";

export const AutoPublicPrivateRoute = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  if (isPublicRoute(path)) {
    return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
  } else {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }
};
