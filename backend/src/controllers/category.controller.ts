import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Category from "../models/category.model.js";
import { createCategorySchema } from "../validators/category.validator.js";



const createCategory = asyncHandler(async (req, res) => {

    const { name } = createCategorySchema.parse(req.body)

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(400, "Category already exists");
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

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

    const categories = await Category.find();

    return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories
    });
})

const deleteCategory = asyncHandler(async (req, res) => {

    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Category ID is required");
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: category
    });
})

const updateCategory = asyncHandler(async (req, res) => {

    const { name, isActive } = req.body;

    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Category ID is required");
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const category = await Category.findByIdAndUpdate(id, { name, isActive, slug }, { new: true });
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category
    });
})


export { createCategory, getAllCategories, deleteCategory, updateCategory }
