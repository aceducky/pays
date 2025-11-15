import jwt from "jsonwebtoken";
import {
  ApiError,
  INVALID_SESSION_ERROR,
  ServerError,
} from "../utils/Errors.js";
import { getAccessTokenSecret } from "../utils/envTeller.js";
import { throwEmergencyError } from "../utils/setEmergencyOnAndBlockAllRequests.js";
import { removeRefreshTokenCookie } from "../utils/tokenHelper.js";
import { decodedAccessTokenSchema } from "../zodSchemas/token.zodSchema.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw INVALID_SESSION_ERROR;
  }

  const accessToken = authHeader.split(" ")[1];
  try {
    
    const decoded = jwt.verify(accessToken, getAccessTokenSecret());
    const parsedAccessTokenResult = decodedAccessTokenSchema.safeParse(decoded);

    if (!parsedAccessTokenResult.success) {
      removeRefreshTokenCookie(res);
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
    throw INVALID_SESSION_ERROR;
  }
};

export default authMiddleware;
