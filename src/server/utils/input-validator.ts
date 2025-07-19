import { zValidator } from "@hono/zod-validator";
import { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { z, ZodType } from "zod";

export const validate = <T extends any, Target extends keyof ValidationTargets>(
  schema: T,
  target?: Target
) => {
  return zValidator(target ?? "json", schema as ZodType, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, { cause: result.error });
    }
  });
};
