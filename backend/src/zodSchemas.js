import z from "zod/v4";
import mongoose from "mongoose";
import { paymentSettings } from "./settings/paymentSettings.js";
import { isValidAmountFormat } from "./utils/numberHelpers.js";

export const userIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    error: "Invalid user id",
  });

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
  .min(6, "email must be at least 6 characters")
  .max(30, "email must be at most 30 characters");

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "fullName must be at least 3 characters")
  .max(30, "fullName must be at most 30 characters")
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
        "fullName must only contain letters and spaces, no leading/trailing spaces",
    }
  );

export const decodedJwtSchema = z.object({
  userId: userIdSchema,
  userName: userNameSchema,
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(30, "Password must be at most 30 characters");

export const changeUserInfoSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    oldPassword: passwordSchema.optional(),
    newPassword: passwordSchema.optional(),
  })
  .strip()
  .check((ctx) => {
    const { fullName, oldPassword, newPassword } = ctx.value;
    if (!fullName && !oldPassword && !newPassword) {
      ctx.issues.push({
        code: "custom",
        message:
          "At least fullName or both oldPassword and newPassword or all of them must be provided",
        path: [],
      });
    }
    if (oldPassword || newPassword) {
      if (!oldPassword) {
        ctx.issues.push({
          code: "custom",
          message: "Old password must be provided",
          path: ["oldPassword"],
        });
      }
      if (!newPassword) {
        ctx.issues.push({
          code: "custom",
          message: "New password must be provided",
          path: ["newPassword"],
        });
      }
      if (oldPassword && newPassword && oldPassword === newPassword) {
        ctx.issues.push({
          code: "custom",
          message: "Old password and new password must be different",
          path: ["newPassword"],
        });
      }
    }
  });
export const paymentTypeSchema = z.enum(["", "sent", "received"]);

export const paymentStatusSchema = z.enum(["", "success", "failed"]);

export const paymentSortSchema = z.enum(["", "asc", "desc"]);

export const paymentAmountSchema = z
  .number()
  .refine(
    (v) => {
      return isValidAmountFormat(v);
    },
    {
      error: `Amount must be a positive number with at most 2 decimal places`,
    }
  )
  .min(
    paymentSettings.minAllowedAmount,
    `Amount must be greater than ${paymentSettings.minAllowedAmount} rupees`
  )
  .max(
    paymentSettings.maxAllowedAmount,
    `Amount can not be greater than ${paymentSettings.maxAllowedAmount} rupees`
  );

export const paymentDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description cannot be more than 255 characters")
  .optional();
