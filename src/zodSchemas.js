import z from "zod/v4";
import mongoose from "mongoose";
import { paymentSettings } from "./settings/paymentSettings.js";
import { dollarFormatter } from "./utils/amountHelpers.js";

export const userIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    error: "Invalid user id",
  });

export const userNameSchema = z
  .string("Username must be a string")
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(15, "Username must be at most 15 characters long")
  .toLowerCase()
  .regex(
    /^[a-z][a-z_]+[a-z]$/,
    "Username must start and end with a letter, and can contain underscores in between"
  );

export const queryUsersSchema = userNameSchema.or(z.literal(""));

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
      !v.includes("  ") && // disallow multiple spaces
      v.split(" ").every((name) => /^[a-zA-Z]+$/.test(name)),
    {
      message:
        "Full name must only contain letters with a single space between names (no multiple spaces)",
    }
  );

export const decodedAccessTokenSchema = z.object({
  userId: userIdSchema,
  userName: userNameSchema,
  exp: z.number(),
});

export const decodedRefreshTokenSchema = z.object({
  userId: userIdSchema,
  userName: userNameSchema,
  jti: z.uuidv4(),
  exp: z.number(),
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(30, "Password must be at most 30 characters");

export const passwordChangeSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: "Old password and new password should be different",
    path: ["newPassword"],
  });

export const paymentTypeSchema = z.enum(["", "sent", "received"]);

export const paymentSortSchema = z.enum(["", "asc", "desc"]);

export const paymentAmountStrSchema = z
  .string()
  .trim()
  .refine(
    (v) => {
      const fractionalPart = v.split(".")[1];
      if (fractionalPart?.length > 2) return false;

      const parsedAmount = Number(v);
      return (
        !isNaN(parsedAmount) &&
        parsedAmount >= paymentSettings.minAllowedAmount &&
        parsedAmount <= paymentSettings.maxAllowedAmount
      );
    },
    {
      error: `Amount must be a positive number with at most 2 decimal places and must be between ${dollarFormatter(paymentSettings.minAllowedAmount)} and ${dollarFormatter(paymentSettings.maxAllowedAmount)}`,
    }
  );

export const paymentDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description is optional and cannot be more than 255 characters")
  .optional();
