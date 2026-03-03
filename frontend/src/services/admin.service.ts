import { ProductType } from "@/types/product.types";
import { api } from "./api";

const getAdminProducts = async (): Promise<ProductType[]> => {
    const res = await api.get("/admin/products");
    return res.data.data;
};

const getProductById = async (
    id: string
): Promise<ProductType> => {
    const res = await api.get(`/admin/products/${id}`);
    return res.data.data;
};

export { getAdminProducts, getProductById }