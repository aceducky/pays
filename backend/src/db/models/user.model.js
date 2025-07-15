import argon2 from "argon2";
import mongoose from "mongoose";
import logger from "../../utils/logger.js";
import { emailField, fullNameField, usernameField } from "./commonFields.js";
import {
  isValidAmountFormat,
  to2DecimalPlaces,
} from "../../utils/numberHelpers.js";

const userSchema = new mongoose.Schema(
  {
    username: usernameField("Username",{"unique":[true,"Username must be unique"]}),
    email: emailField("Email"),
    fullName: fullNameField("Full name"),
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    balance: {
      type: Number,
      required: [true, "Balance is required"],
      default: to2DecimalPlaces(1 + Math.random() * 10000),
      validate: {
        validator: function (value) {
          return isValidAmountFormat(value);
        },
        message:
          "Balance must be a non negative number with at most 2 decimal places",
      },

      min: [0, "Balance cannot be negative"],
      max: [
        Number.MAX_SAFE_INTEGER,
        `Balance cannot be more than ${Number.MAX_SAFE_INTEGER}`,
      ],
      set: (value) => to2DecimalPlaces(value),
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
/* Doing this via gui for now
userSchema.searchIndex({
  name: "fullName_search_index", // using `default` as name in gui
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        fullName: { type: "string" },
      },
    },
  },
});
await User.createSearchIndexes();// after connection
* */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password, {
      //https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
      type: argon2.argon2id,
      memoryCost: 9216,
      timeCost: 4,
      parallelism: 1,
    });
    next();
  } catch (err) {
    logger.error("User model", "Error while hashing the password", err);
    next(err);
  }
});

export const User = mongoose.model("User", userSchema);
