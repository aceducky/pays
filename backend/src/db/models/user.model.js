import argon2 from "argon2";
import mongoose from "mongoose";
import logger from "../../utils/logger.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, //if autoIndex is off, then index won't be created. Instead, use:
      // userSchema.index({ username: 1 }, { unique: true });
      trim: true,
      minLength: [6, "Email must be >=6 and <= 30 characters"],
      maxLength: [30, "Email must be >=6 and <= 30 characters"],
      lowercase: true,
    },
    fullname: {
      type: String,
      text: true,
      required: [true, "Fullname is required"],
      index: true,
      trim: true,
      minLength: [3, "Fullname must be >=6 and <= 30 characters"],
      maxLength: [30, "Fullname must be >=6 and <= 30 characters"],
      validate: {
        validator: (v) => {
          if (
            !v ||
            typeof v !== "string" ||
            v.startsWith(" ") ||
            v.endsWith(" ")
          ) {
            return false;
          }
          const splitName = v.trim().split(/\s+/);
          return splitName.every((name) => /^[a-zA-Z]+$/.test(name));
        },
        message:
          "Fullname must only contain letters and spaces, no leading/trailing spaces.",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    balance: {
      type: mongoose.Types.Decimal128,
      required: [true, "Balance is required"],
      default: Math.floor(Math.random() * 10000),
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
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
