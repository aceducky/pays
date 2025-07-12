import "dotenv/config";
import express from "express";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import { getCORS_ORIGIN } from "./utils/envTeller.js";
import { connectToMongoDB } from "./db/index.js";
import { ApiError, ServerError } from "./utils/Errors.js";
import { blockAllRequestsInEmergencyMiddleware } from "./middleware/blockAllRequestsInEmergency.middleware.js";

const app = express();
app.use(
  cors({
    origin: getCORS_ORIGIN(),
    credentials: true,
  })
);
app.use(blockAllRequestsInEmergencyMiddleware);
app.use(
  express.json({
    limit: "2kb",
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", rootRouter);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    logger.error("json parsing", err);
    return res.status(400).json({
      success: false,
      message: "Bad request. Invalid JSON or input",
      data: null,
    });
  }
  if (err.type === "entity.too.large") {
    logger.error("Too large payload", err);
    return res.status(413).json({
      success: false,
      message: "Payload too large",
      data: null,
    });
  }
  if (err.name === "ValidationError") {
    logger.error("ValidationError", err);
    return res.status(400).json({
      success: false,
      message: "Invalid inputs",
      data: null,
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  if (err instanceof ServerError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  logger.error("Global unhandled error", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
});

const PORT = process.env.PORT || 3000;
connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info("Server start", `Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("server start", "Main server error or mongodb error", err);
    throw err;
  });
