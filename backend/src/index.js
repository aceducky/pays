import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "node:path";
import process from "node:process";
import { connectToMongoDB } from "./db/index.js";
import { blockAllRequestsInEmergencyMiddleware } from "./middleware/blockAllRequestsInEmergency.middleware.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware.js";
import { notFoundLimiter } from "./rateLimiters.js";
import { rootRouter } from "./routes/index.js";
import { ApiError, ServerError } from "./utils/Errors.js";
import logger from "./utils/logger.js";

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

app.use((req, _res, next) => {
  console.log("\n________________");
  console.log(`${req.method}: ${req.url}`);
  console.log("  Params: ", req.params);
  console.log("  Body: ", JSON.stringify(req.body));
  console.log("________________\n");
  next();
});
app.use("/api/v1", rootRouter);

const publicDir = path.join(import.meta.dirname, "..", "public");
app.use(express.static(publicDir));

//Not found
app.all("/{*splat}", rateLimitMiddleware(notFoundLimiter), (req, _res) => {
  logger.error(
    "not-found",
    `Invalid Request: Could not ${req.method} ${req.url}`
  );
  throw new ApiError({
    statusCode: 404,
    message: "Page not found",
  });
});

app.use((err, req, res, _next) => {
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

  if(err.message?.includes("CORS")){
    logger.error("cors",{
      Headers: req.headers?.origin,
      Referrer: req.headers?.referrer,
      url: req.originalUrl,
      IP: req.ip,
    })
    return res.status(403).json({
      success: false,
      message: "CORS Error: Not allowed by CORS",
      data: null,
    })
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
