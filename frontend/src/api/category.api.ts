import api from "./api";


export const fetchCategory = async ()  => {
    const response = await api.get("/categories");
    return response;

}

export const createCategory = async (data:FormData) => {
    const response = await api.post("/categories", data);
    return response;
}

export const updateCategory = async (data:FormData, id: string) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response;
}

export const deleteCategory = async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
}