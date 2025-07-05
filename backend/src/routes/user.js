import { Router } from "express";
import reqBodyValidator from "../middleware/reqBodyValidator.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import setAuthTokens from "../utils/tokenHelper.js";
import authenticateAccessToken from "../middleware/authenticateAccessToken.js";
import { User } from "../db/models/user.model.js";
import { getRefreshTokenSecret, isEnvDEVELOPMENT } from "../utils/envTeller.js";
import { emailSchema, fullnameSchema, passwordSchema } from "../zodSchemas.js";
import { verifyPassword } from "../utils/verifyPassword.js";

const router = Router();

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

      return new ApiResponse(
        res,
        201,
        { accessToken },
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
    //next
    const user = await User.findOne({ email });
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
      { accessToken },
      "User signed in successfully"
    );
  }
);

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
    email: email,
    refreshToken: oldRefreshToken,
  });

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

router.post("/logout", authenticateAccessToken, async (req, res) => {
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
  authenticateAccessToken,
  reqBodyValidator(
    z
      .object({
        fullname: fullnameSchema.optional(),
        oldPassword: passwordSchema.optional(),
        newPassword: passwordSchema.optional(),
      })
      .check((ctx) => {
        const { fullname, oldPassword, newPassword } = ctx.value;
        if (!fullname && !oldPassword && !newPassword) {
          ctx.issues.push({
            code: "custom",
            message:
              "At least fullname or both oldPassword and newPassword or all of them must be provided",
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
    const { fullname, oldPassword, newPassword } = req.body;
    const isPasswordChangeRequested = !!oldPassword && !!newPassword;
    const changedFields = [];
    const projection = { email: 1 };
    if (fullname) projection.fullname = 1;
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
        statusCode: 400,
        message: "User not found",
      });
    }

    if (fullname && fullname !== foundUser.fullname) {
      foundUser.fullname = fullname;
      changedFields.push("fullname");
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
          message: "Old password is wrong",
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
      isPasswordChangeRequested ? { accessToken } : null,
      `${changedFields.join(", ")} ${changedFields.length > 1 ? "are" : "is"} changed successfully`
    );
  }
);

export { router as userRouter };
