import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS, HttpStatusCode } from "../constants/httpStatus.js";

const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  let statusCode: HttpStatusCode =
    HTTP_STATUS.INTERNAL_SERVER_ERROR;

  let message = "Internal Server Error";

  let errors: unknown = undefined;

  /**
   * ----------------------------------------
   * Custom ApiError
   * ----------------------------------------
   */
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  }

  /**
   * ----------------------------------------
   * Zod Validation Error
   * ----------------------------------------
   */
  else if (error instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation failed";

    errors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  /**
   * ----------------------------------------
   * Mongoose Validation Error
   * ----------------------------------------
   */
  else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation failed";

    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  /**
   * ----------------------------------------
   * Mongo Duplicate Key Error
   * ----------------------------------------
   */
  else if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = HTTP_STATUS.CONFLICT;

    const duplicateField = Object.keys(
      (error as { keyValue: Record<string, unknown> }).keyValue
    )[0];

    message = `${duplicateField} already exists`;
  }

  /**
   * ----------------------------------------
   * Mongo Cast Error
   * Example:
   * /users/123
   * where 123 is not a valid ObjectId
   * ----------------------------------------
   */
  else if (error instanceof mongoose.Error.CastError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${error.path}`;
  }

  /**
   * ----------------------------------------
   * Normal JavaScript Error
   * ----------------------------------------
   */
  else if (error instanceof Error) {
    message = error.message;
  }

  /**
   * ----------------------------------------
   * Response
   * ----------------------------------------
   */
  res.status(statusCode).json({
    success: false,
    message,
    errors,

    ...(process.env.NODE_ENV === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};

export default errorMiddleware;



// import jwt from "jsonwebtoken";

// import { ApiError } from "./ApiError";
// import { HTTP_STATUS } from "../constants/httpStatus";
// import { MESSAGES } from "../constants/messages";

// export const verifyAccessToken = (token: string) => {
//   try {
//     return jwt.verify(
//       token,
//       process.env.ACCESS_TOKEN_SECRET!
//     );
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       throw new ApiError(
//         HTTP_STATUS.UNAUTHORIZED,
//         MESSAGES.TOKEN_EXPIRED
//       );
//     }

//     if (error instanceof jwt.JsonWebTokenError) {
//       throw new ApiError(
//         HTTP_STATUS.UNAUTHORIZED,
//         MESSAGES.INVALID_TOKEN
//       );
//     }

//     throw new ApiError(
//       HTTP_STATUS.UNAUTHORIZED,
//       MESSAGES.UNAUTHORIZED
//     );
//   }
// };

//Do the same for verifyRefreshToken().