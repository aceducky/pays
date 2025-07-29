import { useLocation } from "react-router";
import { isPublicRoute } from "./routeConfig";
import { Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AUTH_QUERY_KEY } from "../auth/queryClient";
import { api } from "../api/api";
import { useAtom } from "jotai";
import { isAuthenticatedAtom } from "../auth/atoms";
import Loading from "../components/Loading";
import { Navigate } from "react-router";

export const AutoPublicProtectedRoute = () => {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const { isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        if (isAuthenticated) {
          return true;
        }
        const res = await api.post("/user/refresh-token");
        console.log("========\n",res?.data,"\n================")
        console.log(res?.data?.success);
        setIsAuthenticated(true);
        return true;
      } catch (err) {
        console.log("==========\n", err?.response?.data?.message, "\n==========\n");
        if (isAuthenticated) setIsAuthenticated(false);
        return false;
      }
    },
    staleTime: 9 * 60 * 1000,
    retry: false,
  });

  if (isPublicRoute(pathname)) {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <>
        {isLoading && <Loading />}
        <Outlet />
      </>
    );
  } else {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return (
      <>
        {isLoading && <Loading />}
        <Outlet />
      </>
    );
  }
};
