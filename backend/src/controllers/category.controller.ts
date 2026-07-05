import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Category from "../models/category.model.js";
import slugify from "slugify"


const createCategory = asyncHandler(async (req, res) => {

    const {name } = req.body;
    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(400, "Category already exists");
    }

   const slug = slugify(name, {lower: true, trim: true});

    const category = await Category.create({
        name,
        slug
    });

    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
    });
})

const getAllCategories = asyncHandler(async (req, res) => {

    const allCategories = await Category.find();

    return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: allCategories
    });
})

const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        data: category
    });
})


const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: ""
    });
})

const updateCategory = asyncHandler(async (req, res) => {

    const { name } = req.body;

    const { categoryId } = req.params;
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const category = await Category.findByIdAndUpdate(categoryId, { name, slug, isActive: false }, { new: true });
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category
    });
})



export const categoryController = {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory,
    getCategoryById,

}
