import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "../utils/jwt.js";
import { authRepository } from "../repositories/auth.repository.js";


const register = async (data: RegisterInput) => {

    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await authRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword
    })

    return user;

}


const login = async (data: LoginInput) => {

    const user = await authRepository.findByEmail(data.email);
    if (!user) {
        throw new ApiError(400, "Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }


    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await authRepository.updateById(user._id.toString(), {
        refreshToken: hashedRefreshToken,
    });

    return { user, accessToken, refreshToken }

}


export const authService = {
    register,
    login
};