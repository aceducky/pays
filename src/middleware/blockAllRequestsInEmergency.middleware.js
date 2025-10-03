import logger from "../utils/logger.js";
import ApiResponse from "../utils/ApiResponse.js";
import { appSettings } from "../settings/appSettings.js";
import { clearAuthCookies } from "../utils/tokenHelper.js";

export const blockAllRequestsInEmergencyMiddleware = async (req, res, next) => {
  if (appSettings.EMERGENCY_STATE) {
    logger.error(
      "EMERGENCY_STATE",
      "Server is blocking all requests because EMERGENCY_STATE is enabled and it should be fixed immediately"
    );
    await clearAuthCookies(req, res);
    return new ApiResponse({
      res,
      statusCode: 503,
      data: null,
      message: "Server is unavailable",
    });
  }
  next();
};
