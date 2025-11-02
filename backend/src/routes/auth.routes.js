import argon2 from "argon2";
import { Router } from "express";
import { Users } from "../db/models/users.models.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { criticalOperationMiddleware } from "../middleware/criticalOperation.middleware.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import {
  loginLimiter,
  passwordChangeLimiter,
  selfProfileLimiter,
  signupLimiter,
} from "../rateLimiters.js";
import { centsToDollars } from "../utils/amountHelpers.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import { clearAuthCookies, initiateNewTokens } from "../utils/tokenHelper.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import {
  passwordChangeSchema,
  userSignupSchema,
  userLoginSchema,
} from "../../../shared/zodSchemas/user.zodSchema.js";

const router = Router();

router.post(
  "/signup",
  rateLimitMiddleware(signupLimiter),
  reqBodyValidatorMiddleware(userSignupSchema),
  async (req, res) => {
    const { email, userName, fullName, password } = req.body;
    try {
      // MongoDB will handle duplicate email error
      const user = await Users.create({
        email,
        userName,
        fullName,
        password,
        balance: Math.ceil((1 + Math.random()) * 100_000_000),
      });

      // Initiate new tokens with full expiry
      await initiateNewTokens({ req, res, userId: user._id, userName });

      return new ApiResponse({
        res,
        statusCode: 201,
        data: {
          user: {
            userName: user.userName,
            fullName: user.fullName,
            balance: centsToDollars(user.balance),
          },
        },
        message: "User created successfully",
      });
    } catch (err) {
      if (err instanceof ApiError || err instanceof ServerError) {
        throw err;
      }

      if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern)[0];
        // field name from db
        if (duplicateField === "email") {
          throw new ApiError({
            statusCode: 409, // Conflict
            message: "Email already associated with an existing user",
          });
        }
        // field name from db
        if (duplicateField === "userName") {
          throw new ApiError({
            statusCode: 409, // Conflict
            message: "Username taken. Try another one",
          });
        }
      }

      logger.error("signup", "Unknown error occurred", err);
      throw new ServerError();
    }
  }
);

router.post(
  "/login",
  rateLimitMiddleware(loginLimiter),
  reqBodyValidatorMiddleware(userLoginSchema),
  async (req, res) => {
    const { email, password } = req.body;

    const user = await Users.findOne({ email })
      .select("password userName fullName balance")
      .lean();
    if (!user) {
      throw new ApiError({
        statusCode: 401, // Unauthorized
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new ApiError({
        statusCode: 401, // Unauthorized
        message: "Invalid credentials",
      });
    }

    // Initiate new tokens with full expiry for fresh login
    // overrides existing ones, if any
    await initiateNewTokens({
      req,
      res,
      userId: user._id,
      userName: user.userName,
    });

    return new ApiResponse({
      res,
      statusCode: 200,
      data: {
        user: {
          userName: user.userName,
          fullName: user.fullName,
          balance: centsToDollars(user.balance),
        },
      },
      message: "User logged in successfully",
    });
  }
);

router.get(
  "/my-profile",
  rateLimitMiddleware(selfProfileLimiter),
  authMiddleware,
  async (req, res) => {
    const user = await Users.findById(req.userId).select(
      "-_id userName fullName balance"
    );
    return new ApiResponse({
      res,
      statusCode: 200,
      data: {
        user: {
          userName: user.userName,
          fullName: user.fullName,
          balance: centsToDollars(user.balance),
        },
      },
    });
  }
);

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    await clearAuthCookies(req, res);
  } catch (err) {
    logger.error("logout", "Error clearing auth cookies", err);
  }
  // show logout success even if there was an error
  return new ApiResponse({
    res,
    statusCode: 200,
    data: null,
    message: "Logged out successfully",
  });
});

router.post(
  "/password",
  rateLimitMiddleware(passwordChangeLimiter),
  authMiddleware,
  criticalOperationMiddleware,
  reqBodyValidatorMiddleware(passwordChangeSchema),
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await Users.findById(req.userId).select(
      "_id userName password"
    );

    // Verify old password
    if (!(await argon2.verify(user.password, oldPassword))) {
      throw new ApiError({
        statusCode: 400,
        message: "Incorrect old password",
      });
    }

    user.password = newPassword;
    await user.save();

    // Initiate new tokens with full expiry after password change
    await initiateNewTokens({
      req,
      res,
      userId: user._id,
      userName: user.userName,
    });

    return new ApiResponse({
      res,
      statusCode: 200,
      data: null,
      message: "Password updated successfully",
    });
  }
);

export { router as authRouter };
