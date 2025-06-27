import "dotenv/config";
import express from "express";
import cors from "cors";
import { rootRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";

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
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
});