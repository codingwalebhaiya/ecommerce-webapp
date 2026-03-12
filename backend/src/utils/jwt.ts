import jwt from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.types.js"
import ApiError from "./ApiError.js";
import crypto from "crypto"

const generateAccessToken = (payload: AccessTokenPayload): string => {

  if (!process.env.JWT_ACCESS_SECRET_KEY) {
    throw new ApiError(500, "JWT Access Secret Key is not defined in environment variables")
  }
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY!, { expiresIn: "15m" })

}

const generateRefreshToken = (payload: RefreshTokenPayload): string => {

  if (!process.env.JWT_REFRESH_SECRET_KEY) {
    throw new ApiError(500, "JWT Refresh Secret Key is not defined in environment variables")
  }
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY!, { expiresIn: "7d" })

}

const verifyAccessToken = (token: string): AccessTokenPayload => {

  if (!process.env.JWT_ACCESS_SECRET_KEY) {
    throw new ApiError(500, "JWT Access Secret Key is not defined in environment variables")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY!) as AccessTokenPayload;

    if (typeof decoded === "string") {
      throw new ApiError(401, "Invalid access token")
    }

    return decoded as AccessTokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token")
  }


}


const verifyRefreshToken = (token: string): RefreshTokenPayload => {

  if (!process.env.JWT_REFRESH_SECRET_KEY) {
    throw new ApiError(500, "JWT Refresh Secret Key is not defined in environment variables")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY!) as RefreshTokenPayload;

    if (typeof decoded === "string") {
      throw new ApiError(401, "Invalid refresh token")
    }

    return decoded as RefreshTokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }


}

const hashRefreshToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
}

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashRefreshToken }

