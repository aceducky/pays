import axios from "axios";
import { queryClient } from "../utils/queryClient.js";
import { getToken, removeToken, setToken } from "../utils/utils.js";
import { USER_QUERY_KEY } from "../auth/hooks/useUserQuery.js";

const BASE_URL = "https://pays.aceducky.deno.net/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10 * 1000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => {
    const accessToken = response.data?.data?.accessToken;
    if (accessToken) setToken(accessToken);
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // don't try to refresh while handling refresh/logout endpoints (avoids infinite loops)
    const NO_REFRESH_ROUTES = ["/auth/refresh", "/auth/logout"];
    if (
      NO_REFRESH_ROUTES.some((route) => originalRequest.url?.includes(route))
    ) {
      removeToken();
      queryClient.setQueryData(USER_QUERY_KEY, null);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/auth/refresh");
      const newToken = data?.data?.accessToken;

      if (!newToken) throw new Error("No access token returned from refresh");

      setToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      removeToken();
      queryClient.setQueryData(USER_QUERY_KEY, null);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
      if (originalRequest._retry) delete originalRequest._retry;
    }
  }
);

export { api };
