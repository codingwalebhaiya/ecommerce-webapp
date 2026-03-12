import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/user.model.js";

const authMiddleware = asyncHandler(async (req, res, next) => {

  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized")
  }
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select("-password").lean();
  if (!user) {
    throw new ApiError(401, "Unauthorized")
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  }

  next();

})

export default authMiddleware;