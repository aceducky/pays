import "dotenv/config";
import express from "express";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import { connectToMongoDB } from "./db/index.js";
import { ApiError, ServerError } from "./utils/Errors.js";
import { blockAllRequestsInEmergencyMiddleware } from "./middleware/blockAllRequestsInEmergency.middleware.js";

const app = express();
app.disable("x-powered-by");

const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

//Not found
// eslint-disable-next-line no-unused-vars
app.all("/{*splat}", (req, res) => {
  logger.error(
    "not-found",
    `Invalid Request: Could not ${req.method} ${req.url}`
  );
  throw new ApiError({
    statusCode: 404,
    message: "Page not found",
  });
});

// eslint-disable-next-line no-unused-vars
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
