import "dotenv/config";
import express from "express";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", rootRouter);

app.use((err, req, res, next) => {
  logger.error("server", "An error occurred", err);
  res.status(500).json({
    error: "Internal server error",
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info("Server start",`Server is running on port ${PORT}`);
});
