import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user?.role)) {
      return next(new ApiError(403, "Forbidden"));
    }

    next();
  };

export default authorize;
