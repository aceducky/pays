export function normalizeError(error) {
  if (!error) return null;
  if (error instanceof String) return error;
  return (
    error.response?.data?.message ??
    error.message ??
    "An unexpected error occurred"
  );
}

export function getToken() {
  return localStorage.getItem("accessToken");
}

export function setToken(accessToken) {
  localStorage.setItem("accessToken", accessToken);
}

export function removeToken() {
  localStorage.removeItem("accessToken");
}
