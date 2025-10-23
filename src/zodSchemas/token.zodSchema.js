import z from "zod/v4";
import { userIdSchema } from "./user.zodSchema.js";
import { userNameSchema } from "../../shared/zodSchemas/user.zodSchema.js";

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
