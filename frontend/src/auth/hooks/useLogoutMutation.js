import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { USER_QUERY_KEY } from "../queryClient.jsx";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed", error);
    },
  });
}