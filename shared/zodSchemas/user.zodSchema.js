import z from "zod/v4";
import { accountSettings } from "../settings/accountSettings.js";
const {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_EMAIL_LENGTH,
  MAX_EMAIL_LENGTH,
  MIN_FULLNAME_LENGTH,
  MAX_FULLNAME_LENGTH,
} = accountSettings;
export const userNameSchema = z
  .string("Username is required.")
  .trim()
  .min(
    MIN_USERNAME_LENGTH,
    `Username must be at least ${MIN_USERNAME_LENGTH} characters long.`
  )
  .max(
    MAX_USERNAME_LENGTH,
    `Username must be at most ${MAX_USERNAME_LENGTH} characters long.`
  )
  .toLowerCase()
  .regex(
    /^[a-z][a-z_]+[a-z]$/,
    "Username must start and end with a letter, and can contain underscores in between."
  );

export const emailSchema = z
  .email("Email is required.")
  .trim()
  .min(
    MIN_EMAIL_LENGTH,
    `Email must be at least ${MIN_EMAIL_LENGTH} characters long.`
  )
  .max(
    MAX_EMAIL_LENGTH,
    `Email must be at most ${MAX_EMAIL_LENGTH} characters long.`
  );

export const fullNameSchema = z
  .string()
  .trim()
  .min(
    MIN_FULLNAME_LENGTH,
    `Full name must be at least ${MIN_FULLNAME_LENGTH} characters long.`
  )
  .max(
    MAX_FULLNAME_LENGTH,
    `Full name must be at most ${MAX_FULLNAME_LENGTH} characters long.`
  )
  .refine(
    (v) =>
      !v.includes("  ") && // disallow multiple spaces
      v.split(" ").every((name) => /^[a-zA-Z]+$/.test(name)),
    {
      message:
        "Full name must only contain letters with a single space between names.",
    }
  );

export const passwordSchema = z
  .string("Password is required.")
  .min(8, "Password must be at least 8 characters long.")
  .max(30, "Password must be at most 30 characters long.");

export const passwordChangeSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: "Old password and new password must be different.",
    path: ["newPassword"],
  });

export const userSignupSchema = z.object({
  email: emailSchema,
  userName: userNameSchema,
  fullName: fullNameSchema,
  password: passwordSchema,
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userFullNameChangeSchema = z.object({
  fullName: fullNameSchema,
});
