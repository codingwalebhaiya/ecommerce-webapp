
import mongoose, { Schema } from "mongoose";
import { IProductDocument } from "../interfaces/product.interface.js";


const productSchema = new Schema<IProductDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true, trim: true, unique: true},
        price: {
            type: Number,
            required: true,
            min: [0, 'Price must be greater than 0'],
        },
        images: [
            {
                productImageUrl: {
                    type: String,
                    required: true,
                },
                productImagePublicId: {
                    type: String,
                    required: true,
                },
            }
        ],
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        brand:{
            type: String,
            required: true,
            trim: true,
        },
        stock: {
            type: Number,
            required: true,
            min: [0, 'Stock must be greater than 0'],
        }

    },
    {
        timestamps: true,
    }


)

// ==================== INDEXES ====================
// Create a compound index for filters that are ALWAYS run together (Massive performance gain)
productSchema.index({ category: 1, price: 1, isActive: 1 });

// Your text index is brilliant. Keep it exactly like this for navbar searches:
productSchema.index({ name: 'text', description: 'text', brand: 'text' });


const Product = mongoose.model<IProductDocument>("Product", productSchema);


export default Product;