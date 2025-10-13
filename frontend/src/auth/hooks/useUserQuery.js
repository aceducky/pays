import { useQuery } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "../queryClient.jsx";
import { api } from "../../api/api.js";

export const useUserQuery = () => {

  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get("/auth/my-profile");
        const userData = res.data.data.user;
        return userData;
      } catch (err) {
        console.error(err.response?.data?.message ?? err.message);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
