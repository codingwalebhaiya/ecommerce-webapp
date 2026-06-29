import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
 
const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new ApiError(401, "Unauthorized")
  }


  try {
    const decoded: { id: string; email: string; role: 'user' | 'admin' } = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("email role").lean();
    if (!user) {
      throw new ApiError(401, "Unauthorized")
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    }

    next();
  }
  catch (error) {
    // 5. Handle explicit JWT structural errors instead of masking them as 500 errors
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Your login session has expired. Please log in again");
    }
    throw new ApiError(401, "Invalid authentication token signature");
  }


})

export default authenticate;