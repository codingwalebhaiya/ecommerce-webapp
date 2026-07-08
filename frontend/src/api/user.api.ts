import api from "./api";

const getAllUsers = async () => {
    const response = await api.get("/users");
    console.log("user api" , response.data)
    return response.data;

}

const getUserById = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
}

export { getAllUsers, getUserById }