import jwt from "jsonwebtoken";
const getRefreshToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error("User ID and email are required to create a refresh token");
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(
      "REFRESH_TOKEN_SECRET is not defined in environment variables"
    );
  }
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error(
      "REFRESH_TOKEN_EXPIRY is not defined in environment variables"
    );
  }
  return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const getAccessToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error("User ID and email are required to create an access token");
  }
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error(
      "ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }
  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error(
      "ACCESS_TOKEN_EXPIRY is not defined in environment variables"
    );
  }
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const getRefreshTokenAndAccessToken = (userId, email) => {
  const refreshToken = getRefreshToken(userId, email);
  const accessToken = getAccessToken(userId, email);
  return { refreshToken, accessToken };
};

export default getRefreshTokenAndAccessToken;
