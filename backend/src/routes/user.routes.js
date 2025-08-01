import { Router } from "express";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import { clearAuthCookies, setAuthTokens } from "../utils/tokenHelper.js";
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
        201, // Created
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
          statusCode: 409, // Conflict
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

    await setAuthTokens(res, user, getRefreshTokenExpiry());

    return new ApiResponse(
      res,
      200, // OK
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
    200, // OK
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
    200, // OK
    balance,
    "User balance retrieved successfully"
  );
});

router.post("/refresh-token", async (req, res) => {
  const { refreshToken: oldRefreshToken, accessToken: currentAccessToken } =
    req.cookies || {};

  //First check if we even need to refresh
  if (currentAccessToken) {
    const accessTokenSecret = getAccessTokenSecret();
    try {
      jwt.verify(currentAccessToken, accessTokenSecret);
      return new ApiResponse(res, 200, null, "Session still valid"); // OK
    } catch (err) {
      // Only proceed with refresh if token is expired
      if (!(err instanceof jwt.TokenExpiredError)) {
        logger.error("/refresh-token", "Access token verification failed", {
          error: err.message,
          name: err.name,
        });
        throw new ApiError({
          statusCode: 401, // Unauthorized
          message: "Authentication required. Proceed to log in",
        });
      }
    }
  }

  //Validate refresh token presence
  if (!oldRefreshToken) {
    throw new ApiError({
      statusCode: 401, // Unauthorized
      message: "Authentication required. Proceed to log in",
    });
  }

  // Verify refresh token signature/expiry
  let decoded;
  const refreshTokenSecret = getRefreshTokenSecret();
  try {
    decoded = jwt.verify(oldRefreshToken, refreshTokenSecret);
  } catch (err) {
    logger.error("/refresh-token", "Refresh token verification failed", err);
    throw new ApiError({
      statusCode: 403, // Forbidden
      message: "Authentication required. Proceed to log in",
    });
  }

  // Validate decoded payload
  const { userId, userName, exp } = decoded;
  if (!userId || !userName || !exp) {
    throw new ApiError({
      statusCode: 403, // Forbidden
      message: "Authentication required. Proceed to log in",
    });
  }

  // Database lookup - verify user exists and token matches stored value
  const foundUser = await Users.findOne({
    _id: userId,
    refreshToken: oldRefreshToken,
  }).lean();

  if (!foundUser) {
    logger.warn(
      "refresh token",
      `User not found or token mismatch for userId: ${userId}, userName: ${userName}`
    );
    throw new ApiError({
      statusCode: 403, // Forbidden
      message: "Authentication required. Proceed to log in",
    });
  }

  // Calculate remaining time and generate new tokens
  const now = Math.floor(Date.now() / 1000);
  const remainingTimeMs = (exp - now) * 1000;

  await setAuthTokens(res, foundUser, remainingTimeMs);

  return new ApiResponse(res, 200, null, "Session refreshed successfully"); // OK
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

  clearAuthCookies(res);
  return new ApiResponse(res, 200, null, "Logged out successfully"); // OK
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
        statusCode: 404, // Not Found
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
          statusCode: 400, // Bad Request
          message: "Old password is incorrect",
        });
      }
      const isNewPasswordSameAsOldPassword = await verifyPassword(
        foundUser.password,
        newPassword
      );
      if (isNewPasswordSameAsOldPassword) {
        throw new ApiError({
          statusCode: 400, // Bad Request
          message: "Old password and new password must be different",
        });
      }

      const userForToken = {
        _id: foundUser._id,
        userName: req.userName,
      };

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
      changedFields.length > 0 ? 200 : 204, // OK if updated, No Content if nothing to update
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
      200, // OK
      { currFullName: user.fullName },
      "Full name retrieved successfully"
    );
  }
);

export { router as userRouter };
