import { Router } from "express";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import {
  clearRefreshTokenCookie,
  revokeOldAccessToken,
  setAuthTokens,
} from "../utils/tokenHelper.js";
import authenticateAccessTokenMiddleware from "../middleware/authenticateAccessToken.middleware.js";
import { Users } from "../db/models/users.models.js";
import {
  getAccessTokenSecret,
  getRefreshTokenExpiry,
  getRefreshTokenSecret,
} from "../utils/envTeller.js";
import {
  changeUserInfoSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  userNameSchema,
} from "../zodSchemas.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { getPaginationValues } from "../utils/reqQueryHelper.js";
import { to2DecimalPlaces } from "../utils/numberHelpers.js";

const router = Router();

router.post(
  "/signup",
  reqBodyValidatorMiddleware(
    z
      .object({
        email: emailSchema,
        userName: userNameSchema,
        fullName: fullNameSchema,
        password: passwordSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const { email, userName, fullName, password } = req.body;

    try {
      //MongoDB will handle duplicate email error
      const user = await Users.create({
        email,
        userName,
        fullName,
        password,
        balance: to2DecimalPlaces(Math.floor(Math.random() * 10000)),
      });

      await setAuthTokens(res, user);

      return new ApiResponse(
        res,
        201,
        {
          user: {
            email: user.email,
            userName: user.userName,
            fullName: user.fullName,
            balance: user.balance,
          },
        },
        "User created successfully"
      );
    } catch (err) {
      if (err.code === 11000) {
        throw new ApiError({
          statusCode: 409,
          message: "User already exists",
        });
      }
      throw err;
    }
  }
);

router.post(
  "/login",
  reqBodyValidatorMiddleware(
    z
      .object({
        email: emailSchema,
        password: passwordSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const { email, password } = req.body;

    const user = await Users.findOne({ email }).select("-refreshToken").lean();
    if (!user) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    await setAuthTokens(res, user, getRefreshTokenExpiry());

    return new ApiResponse(
      res,
      200,
      {
        user: {
          email,
          userName: user.userName,
          fullName: user.fullName,
          balance: user.balance,
        },
      },
      "User logged in successfully"
    );
  }
);

router.get("/bulk", authenticateAccessTokenMiddleware, async (req, res) => {
  const filterQuery = req.query?.filter?.trim() ?? "";
  const { page, limit, skip } = getPaginationValues(req);
  let users, total;
  if (!filterQuery) {
    [users, total] = await Promise.all([
      await Users.find(
        {},
        {
          _id: 0,
          userName: 1,
          fullName: 1,
        }
      )
        .lean()
        .limit(limit)
        .skip(skip),
      Users.countDocuments(),
    ]);
  } else {
    users = await Users.aggregate([
      {
        $search: {
          text: {
            query: filterQuery,
            path: "fullName",
          },
        },
      },
      {
        $project: {
          userName: 1,
          fullName: 1,
        },
      },
      { $sort: { searchScore: -1 } },
      { $limit: limit },
      { $skip: skip },
    ]);
  }

  return new ApiResponse(
    res,
    200,
    {
      users,
      pagination: {
        page,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    },
    "User(s) retrieved successfully"
  );
});

router.get("/balance", authenticateAccessTokenMiddleware, async (req, res) => {
  const balance = await Users.findById(req.userId, {
    _id: 0,
    balance: 1,
  }).lean();
  return new ApiResponse(
    res,
    200,
    balance,
    "User balance retrieved successfully"
  );
});

router.post("/refresh-token", async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  const currentAccessToken = req.cookies?.accessToken;

  if (!oldRefreshToken) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid or expired refresh token",
    });
  }

  // Check if current access token is still valid
  if (currentAccessToken) {
    try {
      jwt.verify(currentAccessToken, getAccessTokenSecret());
      return new ApiResponse(res, 200, null, "Access token still valid");
    } catch (err) {
      if (!(err instanceof jwt.TokenExpiredError)) {
        // Log and throw other errors (e.g., malformed token, invalid signature)
        logger.error("/refresh-token", "Access token verification failed", {
          error: err.message,
          name: err.name,
        });
        throw new ApiError({
          statusCode: 401,
          message: "Invalid access token",
        });
      }
    }
  }

  const refreshTokenSecret = getRefreshTokenSecret();
  let userId, userName, exp;

  try {
    const decoded = jwt.verify(oldRefreshToken, refreshTokenSecret);
    userId = decoded.userId;
    userName = decoded.userName;
    exp = decoded.exp;
  } catch (err) {
    logger.error("/refresh-token", "Refresh token verification failed", {
      error: err.message,
      name: err.name,
    });
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  if (!userId || !userName || !exp) {
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  // Calculate remaining time for refresh token
  const now = Math.floor(Date.now() / 1000);
  const remainingTimeMs = Math.max((exp - now) * 1000, 0);

  // If token is expired, throw error
  // this check is redundant because jwt.verify handles this
  // but kept for clarity
  if (remainingTimeMs <= 0) {
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  const foundUser = await Users.findOne({
    _id: userId,
    refreshToken: oldRefreshToken,
  }).lean();

  if (!foundUser) {
    logger.warn(
      "refresh token",
      `User not found or update failed for userId: ${userId}, userName: ${userName}`
    );
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  await revokeOldAccessToken(req);
  await setAuthTokens(res, foundUser, remainingTimeMs);

  return new ApiResponse(res, 200, null, "Access token refreshed");
});

router.post("/logout", authenticateAccessTokenMiddleware, async (req, res) => {
  const user = await Users.findByIdAndUpdate(req.userId, {
    $unset: { refreshToken: 1 },
  });

  if (!user) {
    logger.warn("logout", "User not found during logout", {
      userId: req.userId,
    });
  }

  await revokeOldAccessToken(req);
  clearRefreshTokenCookie(res);
  return new ApiResponse(res, 200, null, "Logged out successfully");
});

router.put(
  "/",
  authenticateAccessTokenMiddleware,
  reqBodyValidatorMiddleware(changeUserInfoSchema),
  async (req, res) => {
    const { fullName, oldPassword, newPassword } = req.body;
    const isPasswordChangeRequested = oldPassword && newPassword;
    const changedFields = [];
    const projection = {};
    if (fullName) projection.fullName = 1;
    if (isPasswordChangeRequested) projection.password = 1;
    const foundUser = await Users.findById(req.userId, projection);

    if (!foundUser) {
      logger.warn(
        "access token",
        `Valid access token but user not found in db, user id: ${req.userId}`
      );
      throw new ApiError({
        statusCode: 401,
        message: "User not found",
      });
    }

    if (fullName && fullName !== foundUser.fullName) {
      foundUser.fullName = fullName;
      changedFields.push("fullName");
    }

    if (isPasswordChangeRequested) {
      const isOldPasswordValid = await verifyPassword(
        foundUser.password,
        oldPassword
      );
      if (!isOldPasswordValid) {
        throw new ApiError({
          statusCode: 400,
          message: "Old password is incorrect",
        });
      }
      const isNewPasswordSameAsOldPassword = await verifyPassword(
        foundUser.password,
        newPassword
      );
      if (isNewPasswordSameAsOldPassword) {
        throw new ApiError({
          statusCode: 400,
          message: "Old password and new password must be different",
        });
      }

      const userForToken = {
        _id: foundUser._id,
        userName: req.userName,
      };

      await revokeOldAccessToken(req);
      await setAuthTokens(res, userForToken, getRefreshTokenExpiry());
      foundUser.password = newPassword;
      changedFields.push("password");
    }

    await foundUser.save();

    let data = null;
    if (changedFields.includes("fullName")) {
      data = { user: { fullName } };
    }

    return new ApiResponse(
      res,
      200,
      data,
      changedFields.length > 0
        ? `${changedFields.join(", ")} ${
            changedFields.length > 1 ? "are" : "is"
          } updated successfully`
        : "Nothing to update"
    );
  }
);

router.post(
  "/get-curr-fullname",
  authenticateAccessTokenMiddleware,
  reqBodyValidatorMiddleware(
    z.object({
      userName: userNameSchema,
    })
  ),
  async (req, res) => {
    const { userName } = req.body;
    const user = await Users.findOne({ userName })
      .select("-_id fullName")
      .lean();
    return new ApiResponse(
      res,
      200,
      { currFullName: user.fullName },
      "Full name retrieved successfully"
    );
  }
);

export { router as userRouter };
