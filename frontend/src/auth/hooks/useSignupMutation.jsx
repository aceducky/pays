import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { USER_QUERY_KEY } from "../../utils/queryClient.jsx";

export function useSignupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data) => {
      const res = await api.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: (data) => {
      const user = data.data.user;
      queryClient.setQueryData(USER_QUERY_KEY, user);
      console.log("Signup successful");
    },
    onError: (error) => {
      console.error("Signup failed", error);
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
  });
}
