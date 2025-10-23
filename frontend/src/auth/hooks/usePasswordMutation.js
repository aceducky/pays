import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { normalizeError } from "../../utils/utils.js";

export function usePasswordMutation() {
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/auth/password", data);
      return res.data;
    },
  });

  return {
    passwordMutationAsync: mutation.mutateAsync,
    isPasswordChanging: mutation.isPending,
    passwordError: normalizeError(mutation.error),
  };
}
