export function normalizeError(error) {
  if (!error) return null;
  console.log(error);
  return (
    error.response?.data?.message ??
    error.message ??
    "An unexpected error occurred"
  );
}
