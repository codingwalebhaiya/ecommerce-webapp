

import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { productController } from "../controllers/product.controller.js";
import { uploadProductImages } from "../middlewares/multer.middlware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../constants/roles.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../validations/product.validation.js";


const productRouter = Router();

productRouter.post(
    "/upload-images",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    uploadProductImages.array("images", 3),
    productController.imagesToCloudinary
);

//productRouter.delete("/:productId/images/:imageId", authenticate, authorize(USER_ROLES.ADMIN), productController.deleteProductImage)

productRouter.post("/", authenticate, authorize(USER_ROLES.ADMIN), validate({ body: createProductSchema }), productController.createProduct)
productRouter.get("/", productController.getAllProducts)
productRouter.get("/:productId", productController.getProductById)

productRouter.patch("/:productId", authenticate, authorize(USER_ROLES.ADMIN), validate({ body: updateProductSchema }), productController.updateProduct)
productRouter.delete("/:productId", authenticate, authorize(USER_ROLES.ADMIN), productController.deleteProduct)
productRouter.get("/featured", productController.getFeaturedProducts);


export default productRouter;

