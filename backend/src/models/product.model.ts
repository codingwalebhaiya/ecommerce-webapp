
import mongoose, { Schema, Document } from "mongoose";
import { IProductDocument } from "../types/index.js";

const productSchema = new Schema<IProductDocument>(
    {
        name: { type: String, required: true, index: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        category: { type: String, required: true, index: true },
        brand: { type: String },
        stock: { type: Number, required: true },
        images: [{
            public_id: String, //(needed to delete later)
            secure_url: String, // (to display image)
        },],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true,
    }


)

const Product =
    mongoose.models.Product ||
    mongoose.model<IProductDocument>("Product", productSchema);


export default Product;