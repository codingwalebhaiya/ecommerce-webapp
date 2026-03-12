import { Router } from "express";
import { login, register, profile, logout, refreshAccessToken} from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js";


const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authMiddleware, profile);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.post("/refresh", refreshAccessToken);

export default authRoutes;  