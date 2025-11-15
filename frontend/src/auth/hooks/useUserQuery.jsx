import { useQuery } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "../../utils/queryClient.js";
import { api } from "../../api/api.js";
import { normalizeError, removeToken } from "../../utils/utils.js";

export const useUserQuery = () => {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get("/auth/my-profile");
        const userData = res.data.data.user;
        return userData;
      } catch (err) {
        console.error(normalizeError(err));
        if (err.response?.status === 401) {
        removeToken();
        }
        return null;
      }
    },
    retry: false,
  });
};
