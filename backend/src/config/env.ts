import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: process.env.MONGODB_URI!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET_KEY!,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET_KEY!,

  ACCESS_TOKEN_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  REFRESH_TOKEN_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  CLIENT_URL: process.env.CLIENT_URL!
};