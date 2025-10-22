import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.js";
import { USER_QUERY_KEY } from "../auth/queryClient.jsx";
import { normalizeError } from "../utils/utils.js";

export default function useChangeFullName() {
  const queryClient = useQueryClient();

  const changeFullName = useMutation({
    mutationKey: ["change-fullname"],
    mutationFn: async (data) => {
      const res = await api.patch("/user/fullName", data);
      return res.data;
    },
    onSuccess: (data) => {
      const newFullName = data.data?.fullName;
      if (newFullName) {
        queryClient.setQueryData(USER_QUERY_KEY, (oldUser) => {
          if (!oldUser) return oldUser;
          return { ...oldUser, fullName: newFullName };
        });
      }
      console.log("Change name successful");
    },
    onError: () => {
      console.error("Failed to change name");
    },
  });
  return {
    changeFullNameAsync: changeFullName.mutateAsync,
    isChangingFullName: changeFullName.isPending,
    changeFullNameError: normalizeError(changeFullName.error),
  };
}