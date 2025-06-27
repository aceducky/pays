import mongoose from "mongoose";
import argon2 from "argon2";
import logger from "../utils/logger.js";

try {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info("db", "Connected to MongoDB successfully");
} catch (err) {
  logger.error("db", "Failed to connect to MongoDB:", err.message);
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, //if autoIndex is off, then index won't be created. Instead use:
      // userSchema.index({ username: 1 }, { unique: true });
      trim: true,
      minLength: [6, "Email must be >=6 and <= 30 characters"],
      maxLength: [30, "Email must be >=6 and <= 30 characters"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email is invalid"],
      lowercase: true,
    },
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
      index: true,
      trim: true,
      minLength: [3, "Fullname must be >=6 and <= 30 characters"],
      maxLength: [30, "Fullname must be >=6 and <= 30 characters"],
      match: [
        /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/,
        "Fullname should contain only letters with single spaces between names",
      ],
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
    refreshTokenJwtID: {
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
  } catch (error) {
    next(error);
  }
});

userSchema.methods.verifyPassword = async function (incomingPassword) {
  try {
    return await argon2.verify(this.password, incomingPassword);
  } catch (err) {
    return false;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
