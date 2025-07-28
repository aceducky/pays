import logger from "./logger.js";
import { ServerError } from "./Errors.js";

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
    throw new ServerError();
  }
  return value;
};

const getAccessTokenSecret = () => getEnvVar("ACCESS_TOKEN_SECRET");
const getAccessTokenExpiry = () =>
  parseInt(getEnvVar("ACCESS_TOKEN_EXPIRY"), 10);
const getRefreshTokenSecret = () => getEnvVar("REFRESH_TOKEN_SECRET");
const getRefreshTokenExpiry = () =>
  parseInt(getEnvVar("REFRESH_TOKEN_EXPIRY"), 10);
const getMONGODB_URI = () => getEnvVar("MONGODB_URI");

export {
  getAccessTokenExpiry,
  getAccessTokenSecret,
  getMONGODB_URI,
  getRefreshTokenExpiry,
  getRefreshTokenSecret,
  isEnvDEVELOPMENT,
};
