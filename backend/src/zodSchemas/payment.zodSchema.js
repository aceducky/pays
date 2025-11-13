import mongoose from "mongoose";
import z from "zod/v4";

export const paymentIdSchema = z
  .string()
  .trim()
  .nonempty()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    error: "Invalid payment id.",
  });
export const paymentSortSchema = z.enum(["", "asc", "desc"]);

