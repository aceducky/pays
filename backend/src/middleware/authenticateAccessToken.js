import { ApiError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import jwt from "jsonwebtoken";

const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError({
      statusCode: 401,
      message: "Authorization header missing",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid Authorization header",
    });
  }

  const accessTokenSecret = getAccessTokenSecret();

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (err) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid or expired access token",
    });
  }
};

export default authenticateAccessToken;
