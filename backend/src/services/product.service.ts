import { ApiError } from "../utils/ApiError.js";
import { uploadMultipleImages } from "../utils/uploadToCloudinary.js";
import { CreateProductInput, ProductQueryInput, UpdateProductInput } from "../validations/product.validation.js";
import slugify from "slugify";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const uploadProductImages = async (files: Express.Multer.File[]) => {

    if (!files || files.length === 0) {
        throw new Error("Please upload at least one image.");
    }
    return await uploadMultipleImages(files);
}


const createProduct = async (
    data: CreateProductInput
) => {

    if (
        data.images.length < 1 ||
        data.images.length > 3
    ) {

        throw new ApiError(
            400,
            "Product must contain between 1 and 3 images."
        );

    }

    const slug = slugify(
        data.name,
        {
            lower: true,
            strict: true
        }
    );


    const product =
        await Product.create({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            isFeatured: data.isFeatured,
            images: data.images,
            slug,
            stock: data.stock,
            brand: data.brand

        })


    return product;

}

const updateProduct = async (
    productId: string,
    data: UpdateProductInput
) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return await product.updateOne(data);
}


const deleteProduct = async (
    productId: string
) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return await product.deleteOne();
}


const getProductById = async (
    productId: string
) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return product;
}

const getAllProducts = async (filters: ProductQueryInput) => {
    const { page, limit, category, brand, minPrice, maxPrice, sort, search } = filters;

    const queryObj: any = { isActive: true }; // Only show active products to buyers

    // 1. Navbar Category Filter Resolution (Slug string -> ObjectId conversion)
    if (category) {
        // Look up the category document using the user-friendly slug from the URL
        const targetCategory = await Category.findOne({ slug: category.toLowerCase(), isActive: true });

        if (!targetCategory) {
            return { products: [], totalResults: 0 }; // Category doesn't exist, return early
        }
        // Assign the actual database ObjectId to the product search criteria query object
        queryObj.category = targetCategory._id;
    }

    // 2. Navbar Full-Text Search Implementation
    if (search) {
        // Leveraging your exact productSchema.index({ name: 'text', ... })
        queryObj.$text = { $search: search };
    }

    // 3. Sidebar Brand Filter
    if (brand) {
        // Use regex fallback for precise brand selection matching if brand isn't part of standard indexing
        queryObj.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // 4. Sidebar Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        queryObj.price = {};
        if (minPrice !== undefined) queryObj.price.$gte = minPrice;
        if (maxPrice !== undefined) queryObj.price.$lte = maxPrice;
    }

    // 5. Dynamic Sorting Map
    let sortOption: any = { createdAt: -1 }; // Default: Newest products
    if (sort === 'price') sortOption = { price: 1 };   // Low to High
    if (sort === '-price') sortOption = { price: -1 }; // High to Low

    // If text searching, sort results by relevance score matching by default
    if (search && !sort) {
        sortOption = { score: { $meta: "textScore" } };
    }

    // 6. Compute Pagination Bounds
    const skip = (page - 1) * limit;

    // 7. Concurrent database query lookups
    const [products, totalResults] = await Promise.all([
        Product.find(queryObj)
            .select(search ? { score: { $meta: "textScore" } } : {}) // Inject text score matching metadata if searching
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('category', 'name slug') // Merges clean category metadata names back into frontend arrays
            .lean(),
        Product.countDocuments(queryObj)
    ]);

    return { products, totalResults };
}

const getFeaturedProducts = async (limitCount: number = 8) => {
    // Leverages your exact 'productSchema.index({ isFeatured: 1, isActive: 1 })' compound index!
    const products = await Product.find({ isFeatured: true, isActive: true })
        .sort({ createdAt: -1 }) // Show newly pinned features first
        .limit(limitCount)
        .select('name price images brand slug description') // Lean payload selection (skip heavy text fields)
        .lean();

    return products;

};

export const productService = {
    uploadProductImages,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
    getFeaturedProducts
}
