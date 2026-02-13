import { Router } from "express";
import { generateUploadSignature } from "../controllers/cloudinary.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const cloudinaryRoutes = Router();

cloudinaryRoutes.get("/", authMiddleware, authorize("ADMIN"), generateUploadSignature);

export default cloudinaryRoutes;