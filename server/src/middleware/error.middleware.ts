import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  const isApiError = error instanceof ApiError;

  const statusCode = isApiError ? error.statusCode : 500;
  const code = isApiError ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isApiError
    ? error.message
    : "An unexpected server error occurred.";

  if (!isApiError || env.NODE_ENV !== "production") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(isApiError && error.details !== undefined
        ? { details: error.details }
        : {})
    }
  });
};
