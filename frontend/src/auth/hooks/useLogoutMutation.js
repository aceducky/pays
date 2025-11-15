import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../api/api.js";
import { USER_QUERY_KEY } from "../../utils/queryClient.js";
import { normalizeError, removeToken } from "../../utils/utils.js";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      removeToken();
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
    onSuccess: () => {
      console.log("Logout successful");
    },
    onError: (error) => {
      const err = normalizeError(error);
      toast.error(err);
      console.error("Logout failed", err);
    },
  });
}
