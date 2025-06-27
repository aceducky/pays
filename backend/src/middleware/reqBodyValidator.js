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
