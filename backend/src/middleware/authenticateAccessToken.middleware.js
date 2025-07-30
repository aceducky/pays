import { ApiError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { setEmergencyOnAndBlockAllRequests } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { decodedAccessTokenSchema } from "../zodSchemas.js";

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
    const parseResult = decodedAccessTokenSchema.safeParse(decoded);

    if (!parseResult.success) {
      logger.error(
        "EMERGENCY",
        "User's name or email is invalid but the related access token is valid",
        "token info:",
        {
          userId: decoded?.userId || "unknown",
          userName: decoded?.userName || "unknown",
          errors: parseResult.error?.issues || "parse failed",
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        }
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
      message: "Your session has expired or is invalid. Please log in",
    });
  }
};

export default authenticateAccessTokenMiddleware;
