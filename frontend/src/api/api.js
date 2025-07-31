import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});
// Simple wrapper that handles one retry with /refresh-token
const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    return await api[method](url, data, config);
  } catch (error) {
    // If it's not 401, try refresh once and retry
    if (error.response?.status !== 401) {
      throw error;
    }

    await api.post("/user/refresh-token");
    // Retry original request
    return await api[method](url, data, config);
  }
};
export { api };
