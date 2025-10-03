import { verifyAndParseRefreshToken } from "../utils/tokenHelper.js";

export const criticalOperationMiddleware = async (req, res, next) => {
  /**
   * Only to be used after using authMiddleware
   * Ensures refresh token is valid for critical operations
   * Skips validation if already checked during token refresh flow in authMiddleware
   */
  if (!req._userRefreshTokenIsChecked) {
    await verifyAndParseRefreshToken(req);
  }
  next();
};
