import axios from "axios";
import { queryClient, USER_QUERY_KEY } from "../auth/queryClient.jsx";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor logic for logout endpoint
    if (originalRequest.url?.includes("/auth/logout")) {
      throw error;
    }

    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // First 401: retry
    if (error.response?.status === 401 && originalRequest._retryCount < 1) {
      originalRequest._retryCount++;
      return api(originalRequest);
    }

    // Second 401: logout
    if (
      error.response?.status === 401 &&
      originalRequest._retryCount >= 1 &&
      !isLoggingOut
    ) {
      isLoggingOut = true;

      // Clear user from cache immediately
      queryClient.setQueryData(USER_QUERY_KEY, null);

      isLoggingOut = false;
    }

  throw error;
  }
);

export { api };
