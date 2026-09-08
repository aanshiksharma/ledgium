import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";

export const notFoundMiddleware: RequestHandler = (req) => {
  throw new ApiError(
    404,
    `Route not found: ${req.method} ${req.originalUrl}`,
    "ROUTE_NOT_FOUND"
  );
};
