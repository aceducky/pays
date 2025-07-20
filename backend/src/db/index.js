import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { getMONGODB_URI } from "../utils/envTeller.js";

mongoose.set("transactionAsyncLocalStorage", true);

async function connectToMongoDB() {
  try {
    logger.info("db connection", "Started trying to connect to db");
    const connectionInstance = await mongoose.connect(getMONGODB_URI());
    logger.info(
      "db start",
      "Connected to MongoDB:",
      connectionInstance.connection.host
    );
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    logger.error("db connection", "Failed to connect to MongoDB");
    process.exit(1);
  }
}

export { connectToMongoDB };
