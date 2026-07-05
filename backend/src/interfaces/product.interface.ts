import { Document } from "mongoose";
import { ICategory } from "./category.interface.js";

export interface IProductImage {
    productImageUrl: string;
    productImagePublicId: string;
}

export interface IProduct {
    name: string;
    description: string;
    slug: string;
    price: number;
    images: IProductImage[];
    category: string | ICategory;
    isFeatured: boolean;
    isActive: boolean;
    stock: number;
    brand: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document { }