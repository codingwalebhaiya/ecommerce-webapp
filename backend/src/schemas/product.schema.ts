import { z } from "zod"
import { objectIdSchema } from "./common.schema.js";

// create product
export const createProductSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    price: z.number().positive("Price must be a positive number"),
    discountPrice: z.number().optional(),
    category: z.string().min(2, "Category must be at least 2 characters long"),
    brand: z.string().optional(),
    stock: z.number().int().min(0, "Stock must be a non-negative integer"),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
})


// update product 
export const updateProductSchema = createProductSchema.partial();


// product params 
export const productParamsSchema = z.object({
    productId: objectIdSchema
})