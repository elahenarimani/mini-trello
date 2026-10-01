import type { ErrorRequestHandler, RequestHandler } from "express";
import { safeErrorCode } from "../config/database.js";

export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }
  // Never log driver messages, SQL, parameters, connection strings, or stacks.
  console.error("Request failed", { code: safeErrorCode(error) });
  res.status(500).json({ message: "Internal server error" });
};
