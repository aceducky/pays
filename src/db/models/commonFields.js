export const userNameField = (options = {}) => ({
  type: String,
  trim: true,
  lowercase: true,
  immutable: true,
  minLength: [3, "Username must be at least 3 characters long"],
  maxLength: [15, "Username must be at most 15 characters long"],
  match: [
    /^[a-z][a-z_]+[a-z]$/,
    "Username must start and end with a letter, and can contain underscores in between",
  ],
  ...options,
});
export const fullNameField = (options = {}) => ({
  type: String,
  required: [true, "Full name is required"],
  trim: true,
  minLength: [3, "Full name must be >=6 and <= 30 characters"],
  maxLength: [30, "Full name must be >=6 and <= 30 characters"],
  validate: {
    validator: (v) => {
      if (!v || typeof v !== "string") return false;
      //disallow mutliple spaces
      if (v.includes("  ")) return false;
      if (v.startsWith(" ") || v.endsWith(" ")) return false;
      const words = v.trim().split(" ");
      return words.every((w) => /^[a-zA-Z]+$/.test(w));
    },
    message:
      "Full name must only contain letters with a single space between names (no multiple spaces)",
  },
  ...options,
});
