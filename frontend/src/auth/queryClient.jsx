import { QueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../api/api";
import { useAtom } from "jotai";
import { isAuthenticatedAtom } from "./atoms";

export const AUTH_QUERY_KEY = ["auth"];
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1 * 60 * 1000, 
    },
  },
});

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const login = useMutation({
    mutationFn: async (data) => {
      return await api.post("/user/login", data);
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
