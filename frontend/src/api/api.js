import axios from "axios";
import { queryClient, USER_QUERY_KEY } from "../utils/queryClient.jsx";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  // baseURL: "https://pays.aceducky.deno.net/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes("/auth/logout") &&
      error.response?.status === 401
    ) {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      throw error;
    }

  if (error.response?.status === 401) {
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < 1) {
        originalRequest._retryCount++;
        return await api(originalRequest);
      }

      queryClient.setQueryData(USER_QUERY_KEY, null);
    }

    throw error;
  }
);

export { api };
