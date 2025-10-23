import { appSettings } from "../settings/appSettings.js";
import { ServerError } from "./Errors.js";
import logger from "./logger.js";

const setEmergencyStateTrue = () => {
  appSettings.EMERGENCY_STATE = true;
};

export const throwEmergencyError = ({
  req,
  parsedResult = null,
  decoded = null,
}) => {
  setEmergencyStateTrue();
  logger.error(
    "EMERGENCY",
    "User's name or email is invalid but the related token is valid",
    "token info:",
    {
      userId: decoded?.userId ?? "unknown",
      userName: decoded?.userName ?? "unknown",
      errors: parsedResult?.error?.issues ?? "parse failed",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    }
  );
  throw new ServerError({
    statusCode: 503,
    message: "Server is unavailable",
  });
};
