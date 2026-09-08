import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/apiError.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new ApiError(
          400,
          "Request body validation failed.",
          "VALIDATION_ERROR",
          result.error.flatten(),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
};
