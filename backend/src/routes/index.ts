import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";


const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/user", userRoutes)



export default routes;