import { ApiError } from "./Errors.js";
import logger from "./logger.js";

const parseIntegerQueryParam = (
  value,
  defaultValue,
  validate,
  errorMessage
) => {
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  if (!validate(parsed)) {
    throw new ApiError({ statusCode: 400, message: errorMessage });
  }
  return parsed;
};

const getPage = (req) =>
  parseIntegerQueryParam(
    req.query?.page,
    1,
    (n) => !isNaN(n) && n > 0,
    "Invalid page parameter"
  );

const getLimit = (req, minLimit = 1, maxLimit = 10) =>
  parseIntegerQueryParam(
    req.query?.limit,
    maxLimit,
    (n) => !isNaN(n) && n >= minLimit && n <= maxLimit,
    "Invalid limit parameter"
  );

const getQueryParam = (req, param, paramSchema, defaultIfUndefined) => {
  const got = req.query[param]?.trim() ?? defaultIfUndefined;
  if (got === undefined) {
    logger.error(
      "query param",
      "param is undefined and defaultIfUndefined is also not specified",
      "param: ",
      param,
      "defaultIfUndefined: ",
      defaultIfUndefined
    );
    throw new ApiError({
      statusCode: 400,
      message: `Invalid ${param} parameter`,
    });
  }

  const result = paramSchema.safeParse(got);
  if (!result.success) {
    throw new ApiError({
      statusCode: 400,
      message: `Invalid ${param} parameter`,
    });
  }
  return got;
};

const getPaginationValues = (req, minLimit = 1, maxLimit = 20) => {
  const page = getPage(req);
  const limit = getLimit(req, minLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export { getPaginationValues, getQueryParam };
