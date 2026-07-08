import { RegisterInput ,LoginInput} from "@/schemas/auth.schema";
import  api  from "./api"

const registerUser = async (data: RegisterInput) => {
    const res = await api.post("/auth/register", data)
    return res.data;
}

const loginUser = async (data: LoginInput) => {
    const res = await api.post("/auth/login", data)
    return res.data;
}

const fetchProfile = async () => {
    const res = await api.get("/auth/profile");
    return res.data;
}

const logoutUser = async () => {
    const res = await api.post("/auth/logout");
    return res.data;
};




export { loginUser, registerUser, fetchProfile, logoutUser }