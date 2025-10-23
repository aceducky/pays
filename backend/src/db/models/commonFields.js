import { accountSettings } from "../../../../shared/settings/accountSettings.js";

const {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_FULLNAME_LENGTH,
  MAX_FULLNAME_LENGTH,
} = accountSettings;

export const userNameField = (options = {}) => ({
  type: String,
  required: [true, "Username is required"],
  trim: true,
  lowercase: true,
  immutable: true,
  minLength: [
    MIN_USERNAME_LENGTH,
    `Username must be at least ${MIN_USERNAME_LENGTH} characters long.`,
  ],
  maxLength: [
    MAX_USERNAME_LENGTH,
    `Username must be at most ${MAX_USERNAME_LENGTH} characters long.`,
  ],
  match: [
    /^[a-z][a-z_]+[a-z]$/,
    "Username must start and end with a letter and may contain only letters and underscores.",
  ],
  ...options,
});

export const fullNameField = (options = {}) => ({
  type: String,
  required: [true, "Full name is required."],
  trim: true,
  minLength: [
    MIN_FULLNAME_LENGTH,
    `Full name must be at least ${MIN_FULLNAME_LENGTH} characters long.`,
  ],
  maxLength: [
    MAX_FULLNAME_LENGTH,
    `Full name must be at most ${MAX_FULLNAME_LENGTH} characters long.`,
  ],
  validate: {
    validator: (v) => {
      if (!v || typeof v !== "string") return false;
      // Disallow multiple spaces
      if (v.includes("  ")) return false;
      if (v.startsWith(" ") || v.endsWith(" ")) return false;
      const words = v.trim().split(" ");
      return words.every((w) => /^[a-zA-Z]+$/.test(w));
    },
    message:
      "Full name may contain only letters and single spaces between words.",
  },
  ...options,
});
