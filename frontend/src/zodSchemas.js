import z from "zod";
export const userNameSchema = z
  .string("Username must be a string")
  .min(3, "Username must be at least 3 characters long")
  .max(15, "Username must be at most 15 characters long")
  .regex(
    /^[a-zA-Z][a-zA-Z_]+[a-zA-Z]$/,
    "Username must start with letters and contain only letters and underscores and be 3 to 15 characters long"
  );

export const emailSchema = z
  .email("Invalid email")
  .trim()
  .min(6, "Email must be at least 6 characters")
  .max(30, "Email must be at most 30 characters");

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "Full name must be at least 3 characters")
  .max(30, "Full name must be at most 30 characters")
  .refine(
    (v) =>
      typeof v === "string" &&
      !v.startsWith(" ") &&
      !v.endsWith(" ") &&
      v
        .trim()
        .split(/\s+/)
        .every((name) => /^[a-zA-Z]+$/.test(name)),
    {
      message:
        "Full name must only contain letters and spaces, no leading/trailing spaces",
    }
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(30, "Password must be at most 30 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  userName: userNameSchema,
  fullName: fullNameSchema,
  password: passwordSchema,
});
