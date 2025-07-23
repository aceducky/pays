import mongoose from "mongoose";
import { getAccessTokenExpiry } from "../../utils/envTeller.js";

const revokedTokensSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: Math.floor(getAccessTokenExpiry() / 1000), // Convert ms to seconds
  },
});

export const RevokedTokens = mongoose.model(
  "RevokedTokens",
  revokedTokensSchema
);
