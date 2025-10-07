export function normalizeError(error) {
  if (!error) return null;
  return error.response?.data?.message || "An unexpected error occurred";
}