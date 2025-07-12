import ApiResponse from "../utils/ApiResponse.js";
import { appSettings } from "../settings/appSettings.js";

export const setEmergencyOnAndBlockAllRequests = (
  res,
  statusCode = 503,
  message = "Server is unavailable"
) => {
  appSettings.EMERGENCY_STATE = true;
  return new ApiResponse(res, statusCode, null, message);
};
