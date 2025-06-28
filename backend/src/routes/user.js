import { Router } from "express";
import User from "../lib/db.js";
import reqBodyValidator from "../middleware/reqBodyValidator.js";
import { z } from "zod/v4";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import getRefreshTokenAndAccessToken from "../utils/tokenHelper.js";

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
        "Fullname must only contain letters and spaces, no leading/trailing spaces.",
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
      if (await User.exists({ email })) {
        return apiError(res, 409, "User already exists");
      }

      let user;
      try {
        user = await User.create({
          email,
          fullname,
          password,
          balance: Math.floor(Math.random() * 10000),
        });
      } catch (err) {
        if (err.name === "ValidationError") {
          return apiError(res, 400, "Invalid user data");
        }
        logger.error("signup", "Error creating user", err);
        return apiError(res, 500, "Internal server error");
      }

      let refreshToken, accessToken;
      try {
        ({ refreshToken, accessToken } = getRefreshTokenAndAccessToken(
          user._id,
          user.email
        ));
      } catch (err) {
        logger.error("signup", "Error generating tokens", err);
        return apiError(
          res,
          500,
          "Account created successfully but could not sign you in automatically. Please proceed to login with your credentials."
        );
      }

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "DEVELOPMENT",
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10),
      });

      try {
        await User.findByIdAndUpdate(
          user._id,
          { refreshToken },
          { new: false, runValidators: true }
        );
      } catch (err) {
        logger.error("signup", "Error saving refresh token", err);
        return apiError(
          res,
          500,
          "Account created successfully but could not sign you in automatically. Please proceed to login with your credentials."
        );
      }

      return apiResponse(
        res,
        200,
        { accessToken },
        "User created successfully"
      );
    } catch (err) {
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

      let refreshToken, accessToken;
      try {
        ({ refreshToken, accessToken } = getRefreshTokenAndAccessToken(
          user._id,
          user.email
        ));
      } catch (err) {
        logger.error("login", "Error generating tokens", err);
        return apiError(res, 500, "Internal server error");
      }

      try {
        await User.findByIdAndUpdate(
          user._id,
          { refreshToken },
          { new: false, runValidators: true }
        );
      } catch (err) {
        logger.error("login", "Error saving refresh token", err);
        return apiError(res, 500, "Internal server error");
      }

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "DEVELOPMENT",
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10),
      });

      return apiResponse(
        res,
        200,
        { accessToken },
        "User signed in successfully"
      );
    } catch (err) {
      logger.error("login", "Unexpected error signing in user", err);
      return apiError(res, 500, "Internal server error");
    }
  }
);

router.post("/refresh-token", async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    return apiError(res, 401, "Refresh token is required");
  }
  try {
    const foundUser = await User.findOne({ refreshToken: oldRefreshToken });
    if (!foundUser) {
      return apiError(res, 403, "Invalid refresh token");
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return apiError(res, 403, "Invalid refresh token");
    }
    if (!decoded || foundUser.email !== decoded.email) {
      return apiError(res, 403, "Invalid refresh token");
    }
    let refreshToken, accessToken;
    try {
      ({ refreshToken, accessToken } = getRefreshTokenAndAccessToken(
        foundUser._id,
        foundUser.email
      ));
    } catch (err) {
      logger.error("refresh-token", "Error generating tokens", err);
      return apiError(res, 500, "Internal server error");
    }

    try {
      await User.findByIdAndUpdate(
        foundUser._id,
        { refreshToken },
        { new: false, runValidators: true }
      );
    } catch (err) {
      logger.error("refresh-token", "Error saving refresh token", err);
      return apiError(res, 500, "Internal server error");
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "DEVELOPMENT",
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10),
    });

    return apiResponse(res, 200, { accessToken }, "Access token refreshed");
  } catch (err) {
    logger.error(
      "refresh-token",
      "Unexpected error refreshing access token",
      err
    );
    return apiError(res, 500, "Internal server error");
  }
});

export { router as userRouter };
