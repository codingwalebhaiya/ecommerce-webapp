import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { myProfile } from "../controllers/user.controller.js";
import authorize from "../middlewares/authorize.middleware.js";

const userRoutes = Router();

userRoutes.get("/profile", authMiddleware, authorize("USER") ,myProfile);

export default userRoutes;