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

router.post(
  "/signup",
  reqBodyValidator(
    z
      .object({
        email: z.email().min(6).max(30),
        fullname: z.string().min(3).max(30),
        password: z.string().min(8).max(30),
      })
      .strip()
  ),
  async (req, res) => {
    const { email, fullname, password } = req.body;
    try {
      const userExists = await User.exists({ email });
      if (userExists) {
        return apiError(res, 409, "User already exists");
      }
      // Create a new user
      const user = await User.create({
        email,
        fullname,
        password,
        balance: Math.floor(Math.random() * 10000),
      });
      // Generate refresh token and access token
      const { refreshToken, accessToken } = getRefreshTokenAndAccessToken(
        user._id,
        user.email
      );
      //Set refresh token as secure cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "DEVELOPMENT",
        maxAge: 7 * 1000 * 60 * 60 * 24, // 7 days
      });

      // Set refresh token and jwt ID in the database
      try {
        await User.findByIdAndUpdate(
          user._id,
          { refreshToken },
          { new: false, runValidators: true }
        );
      } catch (err) {
        console.error("Error saving refresh token JWT ID", err);
        return apiError(res, 500, "Internal server error");
      }
      return apiResponse(
        res,
        200,
        { accessToken },
        "User created successfully"
      );
    } catch (err) {
      logger.error("signup", "Error signin up new user", err);
      return apiError(res, 500, "Internal server error");
    }
  }
);
router.post(
  "/login",
  reqBodyValidator(
    z
      .object({
        email: z.email().min(6).max(30),
        password: z.string().min(8).max(30),
      })
      .strip()
  ),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return apiError(res, 401, "Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return apiError(res, 401, "Invalid credentials");
      }

      // Generate new tokens
      const { refreshToken, accessToken } = getRefreshTokenAndAccessToken(
        user._id,
        user.email
      );

      // Update user with new refresh token
      await User.findByIdAndUpdate(
        user._id,
        { refreshToken },
        { new: false, runValidators: true }
      );

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "DEVELOPMENT",
        maxAge: 7 * 1000 * 60 * 60 * 24, // 7 days
      });

      return apiResponse(
        res,
        200,
        { accessToken },
        "User signed in successfully"
      );
    } catch (err) {
      logger.error("signin", "Error signing in user", err);
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
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== oldRefreshToken) {
      return apiError(res, 403, "Invalid refresh token");
    }

    // Generate new tokens
    const { refreshToken, accessToken } = getRefreshTokenAndAccessToken(
      user._id,
      user.email
    );

    // Update user with new refresh token
    await User.findByIdAndUpdate(
      user._id,
      { refreshToken},
      { new: false, runValidators: true }
    );

    // Set new refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "DEVELOPMENT",
      maxAge: 7 * 1000 * 60 * 60 * 24, // 7 days
    });

    return apiResponse(res, 200, { accessToken }, "Access token refreshed");
  } catch (err) {
    logger.error("refresh-token", "Error refreshing access token", err);
    return apiError(res, 403, "Invalid or expired refresh token");
  }
});

export { router as userRouter };
