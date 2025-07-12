import logger from "../utils/logger.js";
import ApiResponse from "../utils/ApiResponse.js";
import { appSettings } from "../settings/appSettings.js";

export const blockAllRequestsInEmergencyMiddleware = (req, res, next) => {
  if (appSettings.EMERGENCY_STATE) {
    logger.error(
      "EMERGENCY_STATE",
      "Server is blocking all requests because EMERGENCY_STATE is enabled and it should be fixed immediately"
    );
    return new ApiResponse(res, 503, null, "Server is unavailable");
  }
  next();
};
