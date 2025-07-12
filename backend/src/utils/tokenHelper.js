import jwt from "jsonwebtoken";
import { ApiError, ServerError } from "./Errors.js";
import logger from "./logger.js";
import {
  getAccessTokenExpiry,
  getAccessTokenSecret,
  getRefreshTokenExpiry,
  getRefreshTokenSecret,
  isEnvDEVELOPMENT,
} from "./envTeller.js";
import { User } from "../db/models/user.model.js";

const generateToken = (payload, token_secret, token_expiry) => {
  if (!token_secret || !token_expiry || !payload) {
    logger.error("token", "Invalid inputs for generateToken");
    throw new ServerError();
  }
  try {
    return jwt.sign(payload, token_secret, { expiresIn: token_expiry });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof TypeError) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid inputs",
      });
    }
    throw err;
  }
};
const getRefreshTokenAndAccessToken = (payload) => {
  const accessToken = generateToken(
    payload,
    getAccessTokenSecret(),
    getAccessTokenExpiry(),
  );
  const refreshToken = generateToken(
    payload,
    getRefreshTokenSecret(),
    getRefreshTokenExpiry(),
  );
  return { refreshToken, accessToken };
};
const setAuthTokens = async (res, user) => {
  const { refreshToken, accessToken } = getRefreshTokenAndAccessToken({
    userId: user._id,
    email: user.email,
  });

  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { _id: user._id, email: user.email },
      { refreshToken },
      { new: true, runValidators: true },
    );
  } catch (err) {
    logger.error(
      "refresh token",
      "Error when setting refresh token in mongodb",
      err,
    );
    throw err;
  }

  if (!updatedUser) {
    throw new ApiError({
      statusCode: 400,
      message: "User not found or failed to update",
    });
  }

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: isEnvDEVELOPMENT() ? "lax" : "strict",
    secure: !isEnvDEVELOPMENT(),
    maxAge: getRefreshTokenExpiry(),
  });

  return accessToken;
};
export default setAuthTokens;
