import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import { createProduct } from "../controllers/product.controller.js";


const productRoutes = Router();

// by only admin 
productRoutes.post("/", authMiddleware, authorize("ADMIN"), createProduct);
//  productRoutes.patch("/:productId", authMiddleware, authorize("ADMIN"), updateProduct);
//  productRoutes.delete("/:productId", authMiddleware, authorize("ADMIN"), deleteProduct);


// // by all users
// productRoutes.get("/", getAllProducts);
// productRoutes.get("/:productId", getProductById);

export default productRoutes;  