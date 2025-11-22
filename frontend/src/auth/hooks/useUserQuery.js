import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/api.js";
import { normalizeError, removeToken } from "../../utils/utils.js";

export const USER_QUERY_KEY = ["user"];

export const useUserQuery = () => {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get("/user/me");
        const user = res?.data?.data?.user;
        return user;
      } catch (err) {
        console.error(normalizeError(err));
        if (err?.response?.status === 401) {
          removeToken();
          return null;
        }
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
