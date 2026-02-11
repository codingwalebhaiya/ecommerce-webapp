import jwt from "jsonwebtoken";
import type { AccessTokenPayload } from "../types/jwt.types.js"

const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY!, { expiresIn: "15m" }) as string;

}

const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY!) as AccessTokenPayload;
}

export { generateAccessToken, verifyAccessToken }

