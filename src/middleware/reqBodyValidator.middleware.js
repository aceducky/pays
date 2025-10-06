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

// export default function reqBodyValidatorMiddleware(schema) {
//   return (req, res, next) => {
//     const result = schema.safeParse(req.body);
//     if (!result.success) {
//       const fieldErrors = result.error.flatten().fieldErrors;
//       const formattedErrors = {};
//       for (const [key, messages] of Object.entries(fieldErrors)) {
//         if (Array.isArray(messages)) {
//           formattedErrors[key] = messages.map((msg) =>
//             String(msg).replace(/expected(\s*\w*)?/i, `expected ${key}`)
//           );
//         } else {
//           formattedErrors[key] = String(messages).replace(
//             /expected(\s*\w*)?/i,
//             `expected ${key}`
//           );
//         }
//       }
//       return res.status(400).json({
//         message: "Invalid inputs",
//         error: formattedErrors,
//       });
//     }
//     req.body = result.data;
//     next();
//   };
// }
