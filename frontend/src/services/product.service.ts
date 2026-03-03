import { CreateProductType, ProductType } from "@/types/product.types";
import { api } from "./api";

const fetchProducts = async (): Promise<ProductType[]> => {
  const res = await api.get("/products");
  return res.data.data;
};

const fetchProductById = async (id: string): Promise<ProductType> => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
};

const createProduct = async (data: CreateProductType): Promise<ProductType> => {
  const res = await api.post("/products", data)
  return res.data.data
}

export { fetchProducts, fetchProductById, createProduct }