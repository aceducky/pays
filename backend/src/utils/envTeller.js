import logger from "./logger.js";
import process from "node:process";

const isEnvDEVELOPMENT = () => {
  if (!process.env.NODE_ENV) {
    logger.warn("env", "NODE_ENV not set");
  }
  return process.env.NODE_ENV?.toUpperCase() === "DEVELOPMENT";
};

const getEnvVar = (key) => {
  const value = process.env[key];
  if (!value) {
    logger.error(key, `ENV does not have ${key} set`);
    const err = new Error("env error", `ENV does not have ${key} set`);
    err.statusCode = 500;
    err.success = false;
    throw err;
  }
  return value;
};

const getAccessTokenSecret = () => getEnvVar("ACCESS_TOKEN_SECRET");
const getAccessTokenExpiryForToken_s = () =>
  Math.floor(parseInt(getEnvVar("ACCESS_TOKEN_EXPIRY_MS"), 10) / 1000); // in s
const getRefreshTokenSecret = () => getEnvVar("REFRESH_TOKEN_SECRET");
const getRefreshTokenExpiryForCookie_ms = () =>
  parseInt(getEnvVar("REFRESH_TOKEN_EXPIRY_MS"), 10); // in ms
const getRefreshTokenExpiryForToken_s = () =>
  Math.floor(parseInt(getEnvVar("REFRESH_TOKEN_EXPIRY_MS"), 10) / 1000); // in s
const getMONGODB_URI = () => getEnvVar("MONGODB_URI");

export {
  getAccessTokenExpiryForToken_s,
  getAccessTokenSecret,
  getMONGODB_URI,
  getRefreshTokenExpiryForCookie_ms,
  getRefreshTokenExpiryForToken_s,
  getRefreshTokenSecret,
  isEnvDEVELOPMENT,
};
