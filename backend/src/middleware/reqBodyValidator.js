export default function reqBodyValidator(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid inputs",
        error: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
// export default function reqBodyValidator(schema) {
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
