import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { normalizeError, removeToken, setToken } from "../../utils/utils.js";

export function usePasswordMutation() {
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/auth/password", data);
      return res.data;
    },
    onSuccess: (data) => {
      // Store new access token if returned
      const { accessToken } = data.data;
      if (accessToken) {
        setToken(accessToken);
      }
    },
    onError: () => {
      removeToken();
    },
  });

  return {
    passwordMutationAsync: mutation.mutateAsync,
    isPasswordChanging: mutation.isPending,
    passwordError: normalizeError(mutation.error),
  };
}
