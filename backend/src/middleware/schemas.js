import z from "zod/v4";

export const emailSchema = z
  .email("Invalid email")
  .min(6, "email must be atleast 6 characters")
  .max(30, "email must be at most 30 characters");
export const fullnameSchema = z
  .string()
  .min(3, "Fullname must be at least 3 characters")
  .max(30, "Fullname must be at most 30 characters")
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
        "Fullname must only contain letters and spaces, no leading/trailing spaces.",
    }
  );
export const passwordSchema = z
  .string()
  .min(8, "Password must be atleast 8 characters")
  .max(30, "Password must be at most 30 characters");
