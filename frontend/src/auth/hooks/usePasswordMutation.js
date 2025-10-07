import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/api.js";

export function usePasswordMutation() {
  return useMutation({
    mutationKey: ["change-password"],
    retry:false,
    mutationFn: async (data) => {
      const res = await api.put("/auth/password", data);
      return res.data;
    },
    onError: (error) => {
      console.error("Failed to change password", error);
    },
  });
}
