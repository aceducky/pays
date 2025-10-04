import z from "zod/v4";
import { userIdSchema, userNameSchema } from "./user.zodSchema.js";

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
