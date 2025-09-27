class ApiResponse {
  constructor({ res, statusCode, data, message = "Success" }) {
    return res.status(statusCode).json({
      message: message,
      data: data,
      success: statusCode < 400
    });
  }
}

export default ApiResponse;
