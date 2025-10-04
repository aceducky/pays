import mongoose from "mongoose";
import { getMONGODB_URI } from "../utils/envTeller.js";
import logger from "../utils/logger.js";

async function connectToMongoDB() {
  try {
    logger.info("db connection", "Started trying to connect to db");
    const connectionInstance = await mongoose.connect(getMONGODB_URI());
    logger.info(
      "db start",
      "Connected to MongoDB:",
      connectionInstance.connection.host
    );
  } catch (err) {
    logger.error("db connection", "Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

export { connectToMongoDB };
