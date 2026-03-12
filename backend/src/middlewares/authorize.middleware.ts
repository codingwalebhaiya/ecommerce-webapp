import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


const authorize = (...roles: string[]) =>
  asyncHandler(async (req, _res, next) => {

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  });

export default authorize;