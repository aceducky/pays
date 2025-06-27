function apiError(res, statusCode, message, data = null) {
  if (typeof statusCode !== "number" || statusCode < 400 || statusCode >= 600) {
    throw new Error(`${statusCode} is not a standard error status code`);
  }
  if (typeof message !== "string") {
    throw new Error(`message must be a string`);
  }

  return res.status(statusCode).json({
    success: false,
    message: message || "Error",
    data,
  });
}

export default apiError;
