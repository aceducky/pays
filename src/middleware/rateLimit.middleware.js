import logger from "../utils/logger.js";

export const rateLimitMiddleware = ({ limiter, category }) => {
  return async (req, res, next) => {
    const key = category === "not-found" ? `${req.ip}` : `${req.ip}:${req.url}`;
    try {
      const { success, limit, remaining, reset } = await limiter.limit(key);

      res.set({
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      });

      if (!success) {
        const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
        res.set("Retry-After", String(retryAfterSec));
        logger.warn("rate-limited", {
          key,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          cookies: JSON.stringify(req.cookies),
          path: req.url,
        });
        return res.status(429).json({
          statusCode: 429,
          message:
            category === "not-found"
              ? "Too many requests. Please try later."
              : `Too many ${category} requests, please try after ${new Date(reset).toLocaleString()}.`,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limit error:", err);
      // Fallback: allow request in case of error
      next();
    }
  };
};
