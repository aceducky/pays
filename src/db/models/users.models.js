import argon2 from "argon2";
import mongoose from "mongoose";
import { accountSettings } from "../../settings/accountSettings.js";
import { isValidCentsFormat } from "../../utils/amountHelpers.js";
import { dollarFormatter } from "../../utils/formatters.js";
import logger from "../../utils/logger.js";
import { fullNameField, userNameField } from "./commonFields.js";

const { MIN_EMAIL_LENGTH, MAX_EMAIL_LENGTH, MIN_BALANCE, MAX_BALANCE } =
  accountSettings;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      minLength: [
        MIN_EMAIL_LENGTH,
        `Email must be at least ${MIN_EMAIL_LENGTH} characters long.`,
      ],
      maxLength: [
        MAX_EMAIL_LENGTH,
        `Email must be at most ${MAX_EMAIL_LENGTH} characters long.`,
      ],
      lowercase: true,
      immutable: true,
    },
    userName: userNameField({ unique: true }),
    fullName: fullNameField(),
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    balance: {
      type: Number,
      required: [true, "Balance is required."],
      min: [MIN_BALANCE, `Balance must be at least ${MIN_BALANCE}.`],
      max: [
        MAX_BALANCE,
        `Balance cannot exceed ${dollarFormatter(MAX_BALANCE)}.`,
      ],
      validate: {
        validator: function (value) {
          return isValidCentsFormat(value);
        },
        message: "Balance must be a number with at most 2 decimal places.",
      },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true, strict: "throw" }
);

// index for user search
userSchema.index({ userName: 1, fullName: 1 });

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
