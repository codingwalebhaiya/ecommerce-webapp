import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      MESSAGES.ACCESS_TOKEN_REQUIRED
    );
  }


  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select("email role").lean();
      if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED
      );
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    }

    next();
  }
  catch (error) {
    next(error);
  }


})

export default authenticate;
