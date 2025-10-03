import z from "zod/v4";
import { paymentSettings } from "../settings/paymentSettings.js";
import { dollarFormatter } from "../utils/formatters.js";

//In dollars
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
        parsedAmount >= paymentSettings.MIN_ALLOWED_AMOUNT &&
        parsedAmount <= paymentSettings.MAX_ALLOWED_AMOUNT
      );
    },
    {
      error: `Amount must be a positive number with at most 2 decimal places and must be between ${dollarFormatter(paymentSettings.MIN_ALLOWED_AMOUNT)} and ${dollarFormatter(paymentSettings.MAX_ALLOWED_AMOUNT)}`,
    }
  );
export const paymentTypeSchema = z.enum(["", "sent", "received"]);
export const paymentSortSchema = z.enum(["", "asc", "desc"]);
export const paymentDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description is optional and cannot be more than 255 characters")
  .optional();
