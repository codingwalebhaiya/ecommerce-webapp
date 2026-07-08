import api from "./api"


const fetchAllProducts = async () => {
    const response = await api.get("/products")
    return response.data;
}


const fetchProductById = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
}

const createProduct = async (formData: FormData) => {
    const response = await api.post("/products", formData);
    return response;
}


const updateProduct = async (id: string, formData: FormData) => {
    const response = await api.patch(`/products/${id}`, formData);
    return response;
}

const deleteProduct = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response;
}

const fetchFeaturedProducts = async () => {
    const response = await api.get("/products/featured?limit=4");

    return response;
}



export { fetchAllProducts, fetchProductById, createProduct, updateProduct, deleteProduct, fetchFeaturedProducts }