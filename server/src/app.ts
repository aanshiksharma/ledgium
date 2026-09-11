import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { API_PREFIX, MAX_REQUEST_BODY_SIZE } from "./config/constants.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";

export const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(express.urlencoded({ extended: false, limit: MAX_REQUEST_BODY_SIZE }));

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "server",
      status: "ok",
    },
  });
});

app.use(API_PREFIX, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
