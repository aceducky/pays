import { ApiError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { setEmergencyOnAndBlockAllRequests } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { decodedJwtSchema } from "../zodSchemas.js";

const authenticateAccessTokenMiddleware = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    throw new ApiError({
      statusCode: 401,
      //Access token missing
      message: "Login required to access this feature",
    });
  }

  const accessTokenSecret = getAccessTokenSecret();
  try {
    const decoded = jwt.verify(accessToken, accessTokenSecret);

    if (!decodedJwtSchema.safeParse(decoded).success) {
      logger.error(
        "EMERGENCY",
        "User's name or email is invalid but the related access token is valid",
        "token info:",
        decoded
      );
      return setEmergencyOnAndBlockAllRequests(res);
    }

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    logger.error("access token", err);
    throw new ApiError({
      statusCode: 401,
      // "Invalid or expired token"
      message: "Your session has expired or is invalid. Please log in",
    });
  }
};

export default authenticateAccessTokenMiddleware;
