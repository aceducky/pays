export function normalizeError(error) {
  if (!error) return null;
  console.log(error);
  if (error instanceof String) return error;
  return (
    error.response?.data?.message ??
    error.message ??
    "An unexpected error occurred"
  );
}
