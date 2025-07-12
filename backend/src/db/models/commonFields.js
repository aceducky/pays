export const fullNameField = (safeFieldName, options = {}) => ({
  type: String,
  required: [true, `${safeFieldName} is required`],
  trim: true,
  minLength: [3, `${safeFieldName} must be >=6 and <= 30 characters`],
  maxLength: [30, `${safeFieldName} must be >=6 and <= 30 characters`],
  validate: {
    validator: (v) => {
      if (!v || typeof v !== "string") return false;
      if (v.startsWith(" ") || v.endsWith(" ")) return false;
      const words = v.trim().split(/\s+/);
      return words.every((w) => /^[A-Za-z]+$/.test(w));
    },
    message: `${safeFieldName} must only contain letters and spaces, no leading/trailing spaces`,
  },
  ...options,
});

export const emailField = (safeFieldName) => ({
  type: String,
  required: [true, `${safeFieldName} is required`],
  unique: true, //if autoIndex is off, then index won't be created. Instead, use:
  // userSchema.index({ username: 1 }, { unique: true });
  trim: true,
  minLength: [6, `${safeFieldName} must be >= 6 and <= 3- characters`],
  maxLength: [30, `${safeFieldName} must be >= 6 and <= 3- characters`],
  lowercase: true,
  immutable: true,
});
