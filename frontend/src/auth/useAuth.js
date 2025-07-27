import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useNavigate } from "react-router";
import { isAuthenticatedAtom, userAtom } from "./atoms";
import { api } from "../api/api";
import { toast } from "sonner";

const REFRESH_INTERVAL = 9 * 60 * 1000; //9 min
const AUTH_QUERY_KEY = "auth";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useAtom(userAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

  const { isError } = useQuery({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: async () => {
      const res = await api.post("/user/refresh-token");
      return res.data; //null even on success
    },
    retry: false,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: true,
    onError: () => {
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/user/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries([AUTH_QUERY_KEY]);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        "Login failed: " + (error.response?.data?.message ?? "Unknown error")
      );
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/user/signup", userData);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries([AUTH_QUERY_KEY]);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        "Signup failed: " + (error.response?.data?.message ?? "Unknown error")
      );
    },
  });

  const logoutMutation = useMutation({
  mutationFn: async () => {
    const response = await api.post("/user/logout");
    return response.data;
  },
  onSuccess: () => {
    setUser(null);
    setIsAuthenticated(false);
    queryClient.removeQueries([AUTH_QUERY_KEY]);
    navigate("/");
  },
  onError: (error) => {
    toast.error("Logout failed: " + (error.response?.data?.message ?? "Unknown error"));
    setUser(null);
    setIsAuthenticated(false);
  }
});

    return {
        user,
        isAuthenticated,
        isAuthenticating: !isError && !user,
        login: loginMutation.mutate,
        signup:signupMutation.mutate,
        logout: logoutMutation.mutate,
        loginError: loginMutation.error,
        signupError: signupMutation.error,
    }
};
