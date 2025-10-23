import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { USER_QUERY_KEY } from "../../utils/queryClient.jsx";
import { toast } from "sonner";
import { normalizeError } from "../../utils/utils.js";

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
      toast.error(normalizeError(error));
      console.error("Logout failed", error.response?.data?.message ?? error.message);
    },
  });
}
