import z from "zod/v4";
import { userNameSchema } from "../../../shared/zodSchemas/index.js";
import { userIdSchema } from "./user.zodSchema.js";

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
