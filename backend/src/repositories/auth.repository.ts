import User from "../models/user.model.js";
import { CreateUserDto } from "../dto/user/create-user.dto.js";
import { UpdateUserDto } from "../dto/user/update-user.dto.js";

const create = (data: CreateUserDto) => {
    return User.create(data);
}

const findByEmail = (email: string) => {
    return User.findOne({ email }).select("+password")
}


const findById = (userId: string) => {
    return User.findById(userId);
}

const updateById = (
    userId: string,
    updateData: UpdateUserDto
) => {
    return User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    });
};



export const authRepository = {
    create,
    findByEmail,
    findById,
    updateById

}