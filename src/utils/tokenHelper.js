import jwt from "jsonwebtoken";
import logger from "./logger.js";
import { ApiError, ServerError } from "./Errors.js";
import {
  getAccessTokenExpiryForCookie_ms,
  getAccessTokenExpiryForToken_s,
  getAccessTokenSecret,
  getRefreshTokenSecret,
  getRefreshTokenExpiryForCookie_ms,
  getRefreshTokenExpiryForToken_s,
  isEnvDEVELOPMENT,
} from "./envTeller.js";
import { randomUUID } from "node:crypto";
import { redis } from "../redis.js";
import { timeRemainingInSeconds } from "./timeUtils.js";
import { INVALID_SESSION_ERROR } from "../middleware/auth.Middleware.js";
import { decodedRefreshTokenSchema } from "../zodSchemas/tokenZodSchema.js";
import { throwEmergencyError } from "./setEmergencyOnAndBlockAllRequests.js";

export const verifyAndParseRefreshToken = async (req) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw INVALID_SESSION_ERROR;
  }
  const refreshTokenSecret = getRefreshTokenSecret();
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshTokenSecret);
  } catch {
    throw INVALID_SESSION_ERROR;
  }

  // Parse and validate the decoded token
  const parsedResult = decodedRefreshTokenSchema.safeParse(decoded);
  if (!parsedResult.success) {
    throwEmergencyError({ req, parsedResult, decoded });
  }

  const { jti, userId } = parsedResult.data;

  // Check if this refresh token JTI is whitelisted for this user
  if (!(await isRefreshTokenWhitelisted(userId, jti))) {
    throw INVALID_SESSION_ERROR;
  }

  return parsedResult.data;
};

const signToken = (payload, secret, expiresIn) => {
  if (!payload || !secret || !expiresIn) {
    logger.error("jwt token", "Missing inputs for signToken");
    throw new ServerError();
  }
  return jwt.sign(payload, secret, { expiresIn });
};

const signAccessToken = (payload) => {
  return signToken(
    payload,
    getAccessTokenSecret(),
    getAccessTokenExpiryForToken_s()
  );
};

const signRefreshToken = (payload, expiresIn) => {
  if (!expiresIn) {
    logger.error(
      "jwt token",
      "Missing expiresIn parameter for signRefreshToken"
    );
    throw new ServerError();
  }

  // Add JTI to payload for refresh tokens
  const jti = randomUUID();
  payload.jti = jti;
  return {
    token: signToken(payload, getRefreshTokenSecret(), expiresIn),
    jti,
  };
};

const setRefreshTokenCookie = (res, token, maxAge) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    maxAge,
  });
};

const setAccessTokenCookie = (res, token, maxAge) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
    maxAge,
  });
};

// Store JTI as whitelisted for a user
const storeRefreshTokenJti = async (userId, jti, expirySeconds) => {
  try {
    await redis.set(`whitelist:${userId}`, jti, {
      ex: expirySeconds,
    });
  } catch (error) {
    logger.error("token whitelist", "Error storing whitelisted token:", error);
    throw new ServerError();
  }
};

// Check if refresh token JTI is whitelisted for user
const isRefreshTokenWhitelisted = async (userId, jti) => {
  try {
    const storedJti = await redis.get(`whitelist:${userId}`);
    return storedJti === jti;
  } catch (error) {
    logger.error("redis", "Error checking token whitelist in Redis:", error);
    throw new ServerError();
  }
};

// Remove JTI from whitelist (for logout)
const removeRefreshTokenFromWhitelist = async (userId) => {
  try {
    await redis.del(`whitelist:${userId}`);
  } catch (error) {
    logger.error("token whitelist", "Error removing whitelisted token:", error);
    throw new ServerError();
  }
};

export const clearAuthCookies = async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;

  if (refreshTokenCookie) {
    try {
      const decoded = jwt.verify(refreshTokenCookie, getRefreshTokenSecret());
      const parsedResult = decodedRefreshTokenSchema.safeParse(decoded);

      if (!parsedResult.success) {
        throwEmergencyError({ req, parsedResult, decoded });
      } else {
        const { userId } = parsedResult.data;
        // Remove from whitelist instead of blacklisting
        await removeRefreshTokenFromWhitelist(userId);
      }
    } catch (err) {
      if (err instanceof ApiError || err instanceof ServerError) {
        throw err;
      }
      logger.error("clearAuthCookies - Invalid or expired refresh token", {
        err,
      });
    }
  }

  const baseCookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: !isEnvDEVELOPMENT(),
  };

  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
};

export const attemptTokenRefreshAndBlackListOldToken = async (req, res) => {
  const { userId, userName, exp } = await verifyAndParseRefreshToken(req);

  const remainingTime_s = timeRemainingInSeconds(exp);

  // Generate new tokens - refresh token with remaining time
  const accessToken = signAccessToken({ userId, userName });
  const { token: refreshToken, jti: newJti } = signRefreshToken(
    { userId, userName },
    remainingTime_s
  );

  // Store new JTI in whitelist with remaining time as expiry
  if (remainingTime_s > 0) {
    await storeRefreshTokenJti(userId, newJti, remainingTime_s);
  }

  // Set cookies - refresh token gets remaining time, access token gets full duration
  setRefreshTokenCookie(res, refreshToken, remainingTime_s * 1000); // in ms
  setAccessTokenCookie(res, accessToken, getAccessTokenExpiryForCookie_ms());

  return { userId, userName };
};

// Function to initiate new tokens (for signup/login)
export const initiateNewTokens = async ({ res, userId, userName }) => {
  const refreshTokenExpirySeconds = getRefreshTokenExpiryForToken_s();
  const accessToken = signAccessToken({ userId, userName });
  const { token: refreshToken, jti } = signRefreshToken(
    { userId, userName },
    refreshTokenExpirySeconds
  );

  try {
    // Store JTI in whitelist with full refresh token expiry
    await storeRefreshTokenJti(userId, jti, refreshTokenExpirySeconds);

    // Set cookies with full expiry times
    setRefreshTokenCookie(
      res,
      refreshToken,
      getRefreshTokenExpiryForCookie_ms()
    );
    setAccessTokenCookie(res, accessToken, getAccessTokenExpiryForCookie_ms());
  } catch (err) {
    if (err instanceof ApiError || err instanceof ServerError) {
      throw err;
    }
    logger.error("initiateNewTokens", "Error setting up tokens:", err);
    throw new ServerError();
  }
};
