
import { asyncHandler } from "../utils/asyncHandler.js";
import { productService } from "../services/product.service.js";
import { CreateProductInput, ProductQueryInput, UpdateProductInput } from "../validations/product.validation.js";

const imagesToCloudinary = asyncHandler(async (req, res) => {

    const files = req.files as Express.Multer.File[];

    const images =
        await productService.uploadProductImages(files);

    return res.status(200).json({

        success: true,

        message: "Images uploaded successfully.",

        images

    })

}
)

const createProduct = asyncHandler(async (req, res) => {

    const validatedData: CreateProductInput = req.body;

    const product = await productService.createProduct(validatedData);

    return res.status(201).json({

        success: true,

        message: "Product created successfully.",

        product

    });

}
)

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    const validatedData: UpdateProductInput = req.body;
    const product = await productService.updateProduct(productId, validatedData);
    return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        product
    });
})


const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    const product = await productService.deleteProduct(productId);
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
        product
    });
})


const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    const product = await productService.getProductById(productId);
    return res.status(200).json({
        success: true,
        message: "Product fetched successfully.",
        product
    });
})


const getAllProducts = asyncHandler(async (req, res) => {
    const queryFilters = req.query as unknown as ProductQueryInput;
    const result = await productService.getAllProducts(queryFilters);
    return res.status(200).json({
        success: true,
        message: "Products fetched successfully.",
        meta: {
            currentPage: queryFilters.page,
            limit: queryFilters.limit,
            totalResults: result.totalResults,
            totalPages: Math.ceil(result.totalResults / queryFilters.limit),
        },
        data: result.products
    });
})


export const productController = {
    imagesToCloudinary,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
}