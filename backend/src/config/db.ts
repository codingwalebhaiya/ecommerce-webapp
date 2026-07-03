import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.util.js"

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(error)

    process.exit(1);
  }
};