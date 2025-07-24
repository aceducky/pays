import { ApiError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { setEmergencyOnAndBlockAllRequests } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { decodedJwtSchema } from "../zodSchemas.js";
import { isRevokedToken } from "../utils/tokenHelper.js";

const authenticateAccessTokenMiddleware = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    throw new ApiError({
      statusCode: 401,
      message: "Access token missing",
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

    if (await isRevokedToken(decoded.jti)) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid or expired token",
      });
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
      message: "Invalid or expired token",
    });
  }
};

export default authenticateAccessTokenMiddleware;
