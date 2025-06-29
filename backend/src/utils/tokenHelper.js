import jwt from "jsonwebtoken";
import User from "../lib/db.js";

const getRefreshToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error(
      "TOKEN_VALIDATION_ERROR: User ID and email are required to create a refresh token"
    );
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(
      "ENV_ERROR: REFRESH_TOKEN_SECRET is not defined in environment variables"
    );
  }
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error(
      "ENV_ERROR: REFRESH_TOKEN_EXPIRY is not defined in environment variables"
    );
  }

  try {
    return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  } catch (err) {
    throw new Error(
      `JWT_ERROR: Failed to create refresh token: ${err.message}`
    );
  }
};

const getAccessToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error(
      "TOKEN_VALIDATION_ERROR: User ID and email are required to create an access token"
    );
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error(
      "ENV_ERROR: ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }
  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error(
      "ENV_ERROR: ACCESS_TOKEN_EXPIRY is not defined in environment variables"
    );
  }

  try {
    return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  } catch (err) {
    throw new Error(`JWT_ERROR: Failed to create access token: ${err.message}`);
  }
};

const getRefreshTokenAndAccessToken = (userId, email) => {
  const refreshToken = getRefreshToken(userId, email);
  const accessToken = getAccessToken(userId, email);
  return { refreshToken, accessToken };
};

const setAuthTokens = async (res, user) => {
  try {
    console.log(user._id,user.email)
    const { refreshToken, accessToken } = getRefreshTokenAndAccessToken(
      user._id,
      user.email
    );

    await User.findByIdAndUpdate(
      { _id: user._id, email: user.email },
      { refreshToken }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "DEVELOPMENT" ? "strict" : "lax",
      secure: process.env.NODE_ENV !== "DEVELOPMENT",
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10),
    });

    return accessToken;
  } catch (err) {
    throw err;
  }
};

export default setAuthTokens;
