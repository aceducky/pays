import argon2 from "argon2";
import logger from "./logger.js";

export const verifyPassword = async (hash, incomingPassword) => {
  if (!incomingPassword) {
    logger.warn("Verify Password", "incoming password is empty or invalid");
    return false;
  }
  try {
    return await argon2.verify(hash, incomingPassword);
  } catch (err) {
    logger.error("User model", "Password verification error", err);
    return false;
  }
};
