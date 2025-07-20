import { ApiError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { setEmergencyOnAndBlockAllRequests } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { decodedJwtSchema } from "../zodSchemas.js";

const authenticateAccessTokenMiddleware = (req, res, next) => {
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
    if (!decodedJwtSchema.safeParse(decoded).success) {
      logger.error(
        "EMERGENCY",
        "User id or email is invalid but the related access token is valid",
        "token info:",
        decoded
      );
      return setEmergencyOnAndBlockAllRequests(res);
    }
    req.userId = decoded.userId;
    req.userName = decoded.userName;
    next();
  } catch (err) {
    logger.error("access token", err);
    throw new ApiError({
      statusCode: 401,
      message: "Invalid or expired access token",
    });
  }
};

export default authenticateAccessTokenMiddleware;
