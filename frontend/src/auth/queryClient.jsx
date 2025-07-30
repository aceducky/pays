import { QueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../api/api";
import { useAtom } from "jotai";
import { isAuthenticatedAtom } from "./atoms";

export const AUTH_QUERY_KEY = ["auth"];
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1 * 60 * 1000, // 1 minutes
    },
  },
});

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const login = useMutation({
    mutationFn: async (data) => {
      let res;
      try {
        res = await api.post("/user/login", data);
        return res?.data;
      } catch (err) {
        if (err.response?.status === 401) {
          /* todo: implement
              main apiRequest function and
              wrapper functions: apiGet, apiPost,apiPut,apiDelete to handle 401 directly when we get a 401,
               make a request to /refresh-token and redo the request,
               its better this way*/
          console.log("YET TO DO");
        }
      }
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      console.log("Login successful");
    },
    onError: (error) => {
      isAuthenticated && setIsAuthenticated(false);
      console.error("Login failed", error);
    },
  });

  const signup = useMutation({
    mutationFn: async (data) => {
      return await api.post("/user/signup", data);
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      console.log("Signup successful");
    },
    onError: (error) => {
      isAuthenticated && setIsAuthenticated(false);
      console.error("Signup failed", error);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      return await api.post("/user/logout");
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      console.log("Logout successful");
    },
    onError: (error) => {
      isAuthenticated && setIsAuthenticated(false);
      console.error("Logout failed", error);
    },
  });

  return {
    login: login.mutate,
    signup: signup.mutate,
    logout: logout.mutate,
    loginError: login.error,
    signupError: signup.error,
    logoutError: logout.error,
  };
}
