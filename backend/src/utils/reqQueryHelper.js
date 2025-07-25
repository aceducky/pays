import { ApiError } from "./Errors.js";

const parseIntegerQueryParam = (
  value,
  defaultValue,
  validate,
  errorMessage
) => {
  if (value === undefined) return defaultValue;

  const parsed = parseInt(value, 10);
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
  let got = req.query[param]?.trim();
  if (got === undefined) {
    got = defaultIfUndefined;
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

const getPaginationValues = (req, minLimit = 1, maxLimit = 10) => {
  const page = getPage(req);
  const limit = getLimit(req, minLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export { getPaginationValues, getQueryParam };
