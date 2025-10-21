import axios from "axios";
import { queryClient, USER_QUERY_KEY } from "../auth/queryClient.jsx";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes("/auth/logout") &&
      error.response?.status === 401
    ) {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      throw error;
    }

    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Retry once
    if (error.response?.status === 401 && originalRequest._retryCount < 1) {
      originalRequest._retryCount++;
      return api(originalRequest);
    }

    if (error.response?.status === 401) {
      queryClient.setQueryData(USER_QUERY_KEY, null);
    }

    throw error;
  }
);

export { api };
