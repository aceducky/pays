import "dotenv/config";
import express from "express";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import apiError from "./utils/apiError.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "2kb",
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", rootRouter);

app.use((err, req, res, next) => {
  if (err.status === 400) {
    if (err instanceof SyntaxError && "body" in err) {
      return apiError(res, 400, "Bad request. Invalid JSON or input");
    }
    return apiError(res, 400, "Bad request");
  }
  logger.error("global catch", "Internal server error", err);
  return apiError(res, 500, "Internal server error");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info("Server start", `Server is running on port ${PORT}`);
});
