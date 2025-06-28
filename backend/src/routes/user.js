import { Router } from "express";
import User from "../lib/db.js";
import reqBodyValidator from "../middleware/reqBodyValidator.js";
import { z } from "zod/v4";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import setAuthTokens from "../utils/tokenHelper.js";
import authenticateAccessToken from "../middleware/authenticateAccessToken.js";

const router = Router();

const emailSchema = z
  .email("Invalid email")
  .min(6, "email must be atleast 6 characters")
  .max(30, "email must be at most 30 characters");

const fullnameSchema = z
  .string()
  .min(3, "Fullname must be at least 3 characters")
  .max(30, "Fullname must be at most 30 characters")
  .refine(
    (v) =>
      typeof v === "string" &&
      !v.startsWith(" ") &&
      !v.endsWith(" ") &&
      v
        .trim()
        .split(/\s+/)
        .every((name) => /^[a-zA-Z]+$/.test(name)),
    {
      message:
        "Fullname must only contain letters and spaces, no leading/trailing spaces",
    }
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be atleast 8 characters")
  .max(30, "Password must be at most 30 characters");

router.post(
  "/signup",
  reqBodyValidator(
    z
      .object({
        email: emailSchema,
        fullname: fullnameSchema,
        password: passwordSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const { email, fullname, password } = req.body;

    try {
      //MongoDB will handle duplicate email error
      const user = await User.create({
        email,
        fullname,
        password,
        balance: Math.floor(Math.random() * 10000),
      });

      const accessToken = await setAuthTokens(res, user);

      return apiResponse(
        res,
        201,
        { accessToken },
        "User created successfully"
      );
    } catch (err) {
      if (err.code === 11000) {
        return apiError(res, 409, "User already exists");
      }

      if (err.name === "ValidationError") {
        return apiError(res, 400, "Invalid user data");
      }

      if (err.message?.startsWith("VALIDATION_ERROR:")) {
        logger.error("signup", "Token validation error", err);
        return apiError(res, 400, "Invalid user data");
      }

      if (
        err.message?.startsWith("ENV_ERROR:") ||
        err.message?.startsWith("JWT_ERROR:")
      ) {
        logger.error("signup", "Token configuration error", err);
        return apiError(
          res,
          500,
          "Account created successfully but could not sign you in automatically.\
          Please proceed to login with your credentials."
        );
      }

      if (err.message?.includes("findByIdAndUpdate")) {
        logger.error("signup", "Error saving refresh token", err);
        return apiError(
          res,
          500,
          "Account created successfully but could not sign you in automatically.\
          Please proceed to login with your credentials."
        );
      }

      logger.error("signup", "Unexpected error signing up new user", err);
      return apiError(res, 500, "Internal server error");
    }
  }
);

router.post(
  "/login",
  reqBodyValidator(
    z
      .object({
        email: emailSchema,
        password: passwordSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return apiError(res, 401, "Invalid credentials");
      }

      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return apiError(res, 401, "Invalid credentials");
      }

      const accessToken = await setAuthTokens(res, user);

      return apiResponse(
        res,
        200,
        { accessToken },
        "User signed in successfully"
      );
    } catch (err) {
      if (err.message?.startsWith("VALIDATION_ERROR:")) {
        logger.error("login", "Token validation error", err);
        return apiError(res, 400, "Invalid credentials");
      }

      if (
        err.message?.startsWith("ENV_ERROR:") ||
        err.message?.startsWith("JWT_ERROR:")
      ) {
        logger.error("login", "Token configuration error", err);
        return apiError(res, 500, "Internal server error");
      }

      if (err.message?.includes("findByIdAndUpdate")) {
        logger.error("login", "Error saving refresh token", err);
        return apiError(res, 500, "Internal server error");
      }

      logger.error("login", "Unexpected error signing in user", err);
      return apiError(res, 500, "Internal server error");
    }
  }
);

router.post("/refresh-token", async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    return apiError(res, 401, "Invalid or expired refresh token");
  }

  try {
    const { userId, email } = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!userId || !email || !emailSchema.safeParse(email).success) {
      return apiError(res, 403, "Invalid or expired refresh token");
    }

    const foundUser = await User.findOne({
      _id: userId,
      email: email,
      refreshToken: oldRefreshToken,
    });

    if (!foundUser) {
      return apiError(res, 403, "Invalid or expired refresh token");
    }

    const accessToken = await setAuthTokens(res, foundUser);

    return apiResponse(res, 200, { accessToken }, "Access token refreshed");
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return apiError(res, 403, "Invalid or expired refresh token");
    }

    logger.error("refresh-token", "Unexpected error", err);
    return apiError(res, 500, "Internal server error");
  }
});

router.post("/logout", authenticateAccessToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, {
      $unset: { refreshToken: 1 },
    });

    if (!user) {
      logger.warn("logout", "User not found during logout", {
        userId: req.user.userId,
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "DEVELOPMENT",
    });

    return apiResponse(res, 200, null, "Logged out successfully");
  } catch (err) {
    logger.error("logout", "Error during logout", err);
    return apiError(res, 500, "Internal server error");
  }
});

export { router as userRouter };
