import mongoose from "mongoose";
import z from "zod/v4";


export const userIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    error: "Invalid user id.",
  });
