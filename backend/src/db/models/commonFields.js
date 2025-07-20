export const userNameField = (options = {}) => ({
  type: String,
  trim: true,
  immutable: true,
  minLength: [3, "Username must be at least 3 characters long"],
  maxLength: [10, "Username must be at most 10 characters long"],
  match: [
    /^[a-zA-Z][a-zA-Z_]+[a-zA-Z]$/,
    "Username must start with letters and only contain letters and underscores and be 3 to 15 characters long",
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
      if (v.startsWith(" ") || v.endsWith(" ")) return false;
      const words = v.trim().split(/\s+/);
      return words.every((w) => /^[A-Za-z]+$/.test(w));
    },
    message:
      "Full name must only contain letters and spaces, no leading/trailing spaces",
  },
  ...options,
});
