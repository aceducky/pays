function apiResponse(res, statusCode, data, message) {
  if (!(res instanceof Object)) {
    throw new Error(`res is not instance of Object`);
  }
  if (typeof statusCode !== "number" || statusCode < 100 || statusCode >= 600) {
    throw new Error(`${statusCode} is not a standard status code`);
  }

  const success = statusCode < 400;
  return res.status(statusCode).json({
    success,
    message: message || (success ? "Success" : "Error"),
    data,
  });
}

export default apiResponse;
