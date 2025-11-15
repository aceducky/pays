import z from "zod/v4";
import { ApiError } from "../utils/Errors.js";
export default function reqBodyValidatorMiddleware(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError({
        statusCode: 422,
        message: "Invalid inputs",
        error: z.flattenError(result.error).fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
