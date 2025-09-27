import argon2 from "argon2";
import mongoose from "mongoose";
import logger from "../../utils/logger.js";
import { fullNameField, userNameField } from "./commonFields.js";
import { dollarFormatter, isValidCentsFormat } from "../../utils/amountHelpers.js";
import { accountSettings } from "../../settings/accountSettings.js";

const userSchema = new mongoose.Schema(
  {
    userName: userNameField({ unique: true }),
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      minLength: [6, "Email must be >= 6 and <= 30 characters"],
      maxLength: [30, "Email must be >= 6 and <= 30 characters"],
      lowercase: true,
      immutable: true,
    },
    fullName: fullNameField(),
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    balance: {
      type: Number,
      required: [true, "Balance is required"],
      default: Math.round(1 + Math.random() * 10000),
      min: [0, "Balance cannot be negative"],
      max: [
        accountSettings.MAX_BALANCE,
        `Balance cannot be more than ${dollarFormatter(accountSettings.MAX_BALANCE)}`,
      ],
      validate: {
        validator: function (value) {
          return isValidCentsFormat(value);
        },
        message:
          "Balance must be a non negative number with at most 2 decimal places",
      },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true, strict: "throw" }
);

// index for user search
userSchema.index({ userName: 1, _id: 1, fullName: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password, {
      //https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    next();
  } catch (err) {
    logger.error("Users model", "Error while hashing the password", err);
    next(err);
  }
});

export const Users = mongoose.model("Users", userSchema);
