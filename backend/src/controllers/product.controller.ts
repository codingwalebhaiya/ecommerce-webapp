import Product from "../models/product.model.js"
import { createProductSchema } from "../schemas/product.schema.js"
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"

const createProduct = asyncHandler(async (req, res) => {

  const productData = createProductSchema.parse(req.body);

  const newProduct = await Product.create(productData);

  res.json(
    new ApiResponse(201, "Product created successfully", newProduct)
  )




})

export { createProduct }