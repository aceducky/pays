import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { paymentRouter } from "./payments.routes.js";
import { userRouter } from "./user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/payments", paymentRouter);

export { router as rootRouter };
