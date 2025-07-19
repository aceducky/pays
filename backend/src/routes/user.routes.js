import { Router } from "express";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import setAuthTokens from "../utils/tokenHelper.js";
import authenticateAccessTokenMiddleware from "../middleware/authenticateAccessToken.middleware.js";
import { User } from "../db/models/user.model.js";
import { getRefreshTokenSecret, isEnvDEVELOPMENT } from "../utils/envTeller.js";
import {
  changeUserInfoSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  userNameSchema,
} from "../zodSchemas.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { getPaginationValues } from "../utils/reqQueryHelper.js";

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
      const user = await User.create({
        email,
        userName,
        fullName,
        password,
        balance: Math.floor(Math.random() * 10000),
      });

      const accessToken = await setAuthTokens(res, user);

      return new ApiResponse(
        res,
        201,
        {
          accessToken,
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

    const user = await User.findOne({ email }).lean();
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

    const accessToken = await setAuthTokens(res, user);

    return new ApiResponse(
      res,
      200,
      {
        accessToken,
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
      await User.find(
        {},
        {
          _id: 1,
          userName: 1,
          fullName: 1,
        }
      )
        .lean()
        .limit(limit)
        .skip(skip),
      User.countDocuments(),
    ]);
  } else {
    const result = await User.aggregate([
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
    users = result;
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
  const balance = await User.findById(req.userId, {
    _id: 0,
    balance: 1,
  }).lean();
  return new ApiResponse(
    res,
    200,
    { balance },
    "User balance retrieved successfully"
  );
});

router.post("/refresh-token", async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid or expired refresh token",
    });
  }
  const refreshTokenSecret = getRefreshTokenSecret();
  let userId, userName;
  try {
    ({ userId, userName } = jwt.verify(oldRefreshToken, refreshTokenSecret));
  } catch (err) {
    logger.error("/refresh-token", err);
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  if (!userId || !userName) {
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  const foundUser = await User.findOne({
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

  const accessToken = await setAuthTokens(res, foundUser);

  return new ApiResponse(res, 200, { accessToken }, "Access token refreshed");
});

router.post("/logout", authenticateAccessTokenMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.userId, {
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
    secure: !isEnvDEVELOPMENT(),
  });

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

    const foundUser = await User.findById(req.userId, projection);

    if (!foundUser) {
      logger.warn(
        "access token",
        `Valid access token but user not found in db , user id: ${req.userId}, user email: ${req.email}`
      );
      throw new ApiError({
        statusCode: 404,
        message: "User not found",
      });
    }

    if (fullName && fullName !== foundUser.fullName) {
      foundUser.fullName = fullName;
      changedFields.push("fullName");
    }

    let accessToken;
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
      accessToken = await setAuthTokens(res, foundUser);
      foundUser.password = newPassword;
      changedFields.push("password");
    }
    await foundUser.save();

    let data = changedFields.length > 0 ? {} : null;
    if (changedFields.includes("fullName")) {
      data.user = { fullName: foundUser.fullName };
    }
    if (changedFields.includes("password")) {
      data.accessToken = accessToken;
    }
    return new ApiResponse(
      res,
      200,
      data,
      changedFields.length > 0
        ? `${changedFields.join(", ")} ${changedFields.length > 1 ? "are" : "is"} updated successfully`
        : "Nothing to update"
    );
  }
);

export { router as userRouter };
