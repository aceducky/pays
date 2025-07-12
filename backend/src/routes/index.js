import express from "express";
import { userRouter } from "./user.routes.js";
import { paymentRouter } from "./payments.routes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/payments", paymentRouter);

export { router as rootRouter };
