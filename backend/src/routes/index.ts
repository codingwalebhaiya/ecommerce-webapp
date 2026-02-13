import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import cloudinaryRoutes from "./cloudinary.route.js";
import productRoutes from "./product.route.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes)
routes.use("/products", productRoutes)
routes.use("/cloudinary-signature", cloudinaryRoutes)



export default routes;