import { isEnvDEVELOPMENT } from "./envTeller.js";

class CustomError extends Error {
  constructor({
    statusCode = 500,
    message = "Something went wrong",
    data = null,
    error = undefined,
    stack = undefined,
  } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.success = false;
    this.data = data;
    if (isEnvDEVELOPMENT()) {
      if (stack) this.stack = stack ?? new Error().stack;
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      error: this.error,
      success: this.success,
      data: this.data,
      ...(isEnvDEVELOPMENT() && { stack: this.stack }),
    };
  }
}

class ApiError extends CustomError {
  constructor({
    statusCode = 400,
    message = "Invalid request",
    data = null,
    error = undefined,
    stack = undefined,
  } = {}) {
    super({ statusCode, message, data, error, stack });
  }
}

class ServerError extends CustomError {
  constructor({
    statusCode = 500,
    message = "Internal server error",
    data = null,
    error = undefined,
    stack = undefined,
  } = {}) {
    super({ statusCode, message, data, error, stack });
  }
}

export { ApiError, ServerError };
