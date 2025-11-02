import mongoose from "mongoose";
import z from "zod/v4";
import { userNameSchema } from "../../../shared/zodSchemas/user.zodSchema.js";


export const userIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    error: "Invalid user id.",
  });

  export const queryUsersSchema = userNameSchema.or(z.literal(""));
