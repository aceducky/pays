import jwt from "jsonwebtoken";
import { ApiError, ServerError } from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import { throwEmergencyError } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { attemptTokenRefreshAndBlackListOldToken } from "../utils/tokenHelper.js";
import { decodedAccessTokenSchema } from "../zodSchemas/token.zodSchema.js";

export const INVALID_SESSION_ERROR = new ApiError({
  statusCode: 401,
  message: "Your session has expired or is invalid. Please log in",
});

const authMiddleware = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies ?? {};

  //both tokens are not there, stop here
  if (!accessToken && !refreshToken) {
    throw INVALID_SESSION_ERROR;
  }

  //Try to validate existing access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, getAccessTokenSecret());
      const parsedAccessTokenResult =
        decodedAccessTokenSchema.safeParse(decoded);

      if (!parsedAccessTokenResult.success) {
        throwEmergencyError({
          req,
          parsedResult: parsedAccessTokenResult,
          decoded,
        });
      }

      req.userId = parsedAccessTokenResult.data.userId;
      req.userName = parsedAccessTokenResult.data.userName;
      // success, can go
      return next();
    } catch (err) {
      if (err instanceof ApiError || err instanceof ServerError) {
        throw err;
      }
      // check if error is not token expired error
      if (err.name !== "TokenExpiredError") {
        throw INVALID_SESSION_ERROR;
      }
      // err is TokenExpiredError
      // So access token is expired
      // fall through to attempt refresh
    }
  }

  if (!refreshToken) throw INVALID_SESSION_ERROR;
  // Try to refresh token if access token is missing or expired
  try {
    const userData = await attemptTokenRefreshAndBlackListOldToken(req, res);
    req.userId = userData.userId;
    req.userName = userData.userName;
    req._userRefreshTokenIsChecked = true;
    return next();
  } catch (err) {
    if (err instanceof ApiError || err instanceof ServerError) throw err;
    throw INVALID_SESSION_ERROR;
  }
};

export default authMiddleware;
