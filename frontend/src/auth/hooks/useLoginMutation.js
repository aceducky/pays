import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { USER_QUERY_KEY } from "../queryClient.jsx";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      const user = data.data.user;
      queryClient.setQueryData(USER_QUERY_KEY, user);
      console.log("Login successful");
    },
    onError: (error) => {
      console.error("Login failed", error);
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
  });
}
