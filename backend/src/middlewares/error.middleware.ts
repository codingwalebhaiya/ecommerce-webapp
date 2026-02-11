import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else {
    message = err.message || message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};

export default errorMiddleware;
