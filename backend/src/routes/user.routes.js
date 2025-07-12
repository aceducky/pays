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
import { emailSchema, fullNameSchema, passwordSchema } from "../zodSchemas.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { getPaginationValues } from "../utils/reqQueryHelper.js";

const router = Router();

router.post(
  "/signup",
  reqBodyValidatorMiddleware(
    z
      .object({
        email: emailSchema,
        fullName: fullNameSchema,
        password: passwordSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const { email, fullName, password } = req.body;

    try {
      //MongoDB will handle duplicate email error
      const user = await User.create({
        email,
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
            _id: user._id,
            email: user.email,
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
          _id: user._id,
          email,
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
          email: 1,
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
          _id: 1,
          email: 1,
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
  let userId, email;
  try {
    ({ userId, email } = jwt.verify(oldRefreshToken, refreshTokenSecret));
  } catch (err) {
    logger.error("/refresh-token", err);
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  if (!userId || !email || !emailSchema.safeParse(email).success) {
    throw new ApiError({
      statusCode: 403,
      message: "Invalid or expired refresh token",
    });
  }

  const foundUser = await User.findOne({
    _id: userId,
    email,
    refreshToken: oldRefreshToken,
  }).lean();

  if (!foundUser) {
    logger.warn(
      "refresh token",
      `User not found or update failed for userId: ${userId}, email: ${email}`
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
  reqBodyValidatorMiddleware(
    z
      .object({
        fullName: fullNameSchema.optional(),
        oldPassword: passwordSchema.optional(),
        newPassword: passwordSchema.optional(),
      })
      .check((ctx) => {
        const { fullName, oldPassword, newPassword } = ctx.value;
        if (!fullName && !oldPassword && !newPassword) {
          ctx.issues.push({
            code: "custom",
            message:
              "At least fullName or both oldPassword and newPassword or all of them must be provided",
            path: [],
          });
        }
        if (oldPassword || newPassword) {
          if (!oldPassword) {
            ctx.issues.push({
              code: "custom",
              message: "Old password must be provided",
              path: ["oldPassword"],
            });
          }
          if (!newPassword) {
            ctx.issues.push({
              code: "custom",
              message: "New password must be provided",
              path: ["newPassword"],
            });
          }
          if (oldPassword && newPassword && oldPassword === newPassword) {
            ctx.issues.push({
              code: "custom",
              message: "Old password and new password must be different",
              path: ["newPassword"],
            });
          }
        }
      })
  ),
  async (req, res) => {
    const { fullName, oldPassword, newPassword } = req.body;
    const isPasswordChangeRequested = oldPassword && newPassword;
    const changedFields = [];
    const projection = { email: 1 };
    if (fullName) projection.fullName = 1;
    if (isPasswordChangeRequested) projection.password = 1;

    const foundUser = await User.findOne(
      {
        _id: req.userId,
        email: req.email,
      },
      projection
    );

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
    return new ApiResponse(
      res,
      200,
      isPasswordChangeRequested
        ? {
            accessToken,
            user: {
              _id: foundUser._id,
              email: foundUser.email,
              fullName: foundUser.fullName,
            },
          }
        : {
            user: {
              _id: foundUser._id,
              email: foundUser.email,
              fullName: foundUser.fullName,
            },
          },
      `${changedFields.join(", ")} ${changedFields.length > 1 ? "are" : "is"} updated successfully`
    );
  }
);

export { router as userRouter };
