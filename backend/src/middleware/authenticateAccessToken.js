import apiError from "../utils/apiError";
import logger from "../utils/logger";

const authenticateAccessToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }
  if (!process.env?.ACCESS_TOKEN_SECRET) {
    logger.error("env", "ACCESS_TOKEN_SECRET is defined in the env");
    return apiError(res, 500, "Internal server error");
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (err) {
    console.error("Access token verification failed:", err);
    return apiError(res, 403, "Invalid access token");
  }
};
export default authenticateAccessToken;
