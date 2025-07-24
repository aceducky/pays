import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { Users } from "../db/models/users.models.js";
import { RevokedTokens } from "../db/models/revokedTokens.models.js";
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
    if (err instanceof jwt.JsonWebTokenError || err instanceof TypeError) {
      logger.error("jwt token", "Error while signing token", err);
      throw new ApiError({
        statusCode: 400,
        message: "Invalid inputs",
      });
    }
    throw err;
  }
};

const generateAuthTokens = ({ userId, userName }, refreshTokenExpiryMs) => {
  const accessToken = signToken(
    { userId, userName, jti: randomUUID() },
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

const setRefreshCookie = (res, token, maxAge) => {
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
  setRefreshCookie(res, refreshToken, expiryMs);
  setAccessTokenCookie(res, accessToken, getAccessTokenExpiry());
};

export const isRevokedToken = async (jti) => {
  const found = await RevokedTokens.findById(jti).lean();
  return Boolean(found);
};

export const clearRefreshTokenCookie = (res, options) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    ...options,
  });
};

export const revokeOldAccessToken = async (req) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    throw new ApiError({
      statusCode: 400,
      message: "Access token missing",
    });
  }

  let decoded;
  try {
    decoded = jwt.decode(accessToken);
    if (!decoded?.jti) {
      throw new ApiError({ statusCode: 400, message: "Invalid token" });
    }
  } catch (err) {
    logger.error("access token", err);
    throw err;
  }

  const jti = decoded.jti;
  await RevokedTokens.create({
    _id: jti,
  });
};

export const clearAuthCookies = (res, options = {}) => {
  clearRefreshTokenCookie(res, options);
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    ...options,
  });
};
