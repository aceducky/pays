import jwt from "jsonwebtoken";
import { Users } from "../db/models/users.models.js";
import logger from "./logger.js";
import { ApiError, ServerError } from "./Errors.js";
import {
  getAccessTokenExpiry,
  getAccessTokenSecret,
  getRefreshTokenExpiry,
  getRefreshTokenSecret,
  isEnvDEVELOPMENT,
} from "./envTeller.js";

const signToken = (payload, secret, expiresIn) => {
  if (!payload || !secret || !expiresIn) {
    logger.error("authService", "Missing inputs for signToken");
    throw new ServerError();
  }

  try {
    return jwt.sign(payload, secret, { expiresIn });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      logger.error("jwt token", "Error while signing token", err);
      throw new ApiError({
        statusCode: 400,
        message: "Invalid inputs",
      });
    }
    logger.error("jwt token", "Unexpected error while signing token", err);
    throw new ServerError();
  }
};

const generateAuthTokens = ({ userId, userName }, refreshTokenExpiryMs) => {
  const accessToken = signToken(
    { userId, userName },
    getAccessTokenSecret(),
    getAccessTokenExpiry()
  );

  const refreshToken = signToken(
    { userId, userName },
    getRefreshTokenSecret(),
    refreshTokenExpiryMs
  );

  return { accessToken, refreshToken };
};

const persistRefreshToken = async (userId, refreshToken) => {
  const user = await Users.findByIdAndUpdate(
    userId,
    { refreshToken },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User not found" });
  }

  return user;
};

const setRefreshTokenCookie = (res, token, maxAge) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: isEnvDEVELOPMENT() ? "lax" : "strict",
    secure: !isEnvDEVELOPMENT(),
    maxAge,
  });
};

const setAccessTokenCookie = (res, token, maxAge) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: isEnvDEVELOPMENT() ? "lax" : "strict",
    secure: !isEnvDEVELOPMENT(),
    maxAge,
  });
};

export const setAuthTokens = async (res, user, refreshTokenExpiryMs) => {
  const expiryMs = refreshTokenExpiryMs || getRefreshTokenExpiry();

  const { accessToken, refreshToken } = generateAuthTokens(
    {
      userId: user._id,
      userName: user.userName,
    },
    expiryMs
  );

  await persistRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(res, refreshToken, expiryMs);
  setAccessTokenCookie(res, accessToken, getAccessTokenExpiry());
};

export const clearAuthCookies = (
  res,
  refreshTokenCookieOptions = {},
  accessTokenCookieOptions = {}
) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    ...refreshTokenCookieOptions,
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    ...accessTokenCookieOptions,
  });
};
