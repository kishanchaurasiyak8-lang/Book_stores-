import { config } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  // If response has already started sending
  if (res.headersSent) {
    return next(err);
  }

  // Handle unique constraint violations
  if (
    err.message?.includes("UNIQUE constraint failed") ||
    err.code === "23505" || // Postgres unique_violation
    err.errcode === 19 // SQLite constraint error
  ) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists or unique constraint violated",
      error: config.isProduction ? undefined : err.message,
    });
  }

  // Handle bad JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
  }

  // Log error in development or server console
  console.error(`[Error] ${req.method} ${req.url} - ${err.stack || err.message}`);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: config.isProduction ? undefined : err.stack,
  });
}

