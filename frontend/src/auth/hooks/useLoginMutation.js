import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { removeToken, setToken } from "../../utils/utils.js";
import { USER_QUERY_KEY } from "./useUserQuery.js";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data.data;
      setToken(accessToken);
      queryClient.setQueryData(USER_QUERY_KEY, user);
      console.log("Login successful");
    },
    onError: (error) => {
      console.error("Login failed", error);
      removeToken();
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
  });
}
