import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserById } from "../api/user.api";


const useGetAllUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
        select: (data) => data.data,
    });
}

const useGetUserById = (id: string) => {
    return useQuery({
        queryKey: ["users", id],
        queryFn: () => getUserById(id),
        select: (data) => data.data,
    });
}


export { useGetAllUsers, useGetUserById }