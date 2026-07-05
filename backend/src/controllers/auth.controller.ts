import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { authService } from "../services/auth.service.js";
import {RegisterInput, LoginInput} from "../validations/auth.validation.js"

const register = asyncHandler(async (req, res) => {
    const validatedData : RegisterInput = req.body; // this come from validate middleware -> validate.middleware.ts
    const user = await authService.register(validatedData);

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", {
            id: user._id,
            email: user.email,
            role: user.role
        })
    );

})

const login = asyncHandler(async (req, res) => {
    const validatedData :LoginInput = req.body;
    const { user, accessToken, refreshToken } = await authService.login(validatedData);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
    }

    res.cookie("accessToken", accessToken,
        {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 min

        }
    )

    res.cookie("refreshToken", refreshToken,
        {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }
    )

    res.status(200).json(
        new ApiResponse(200, "Login successfully", {
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
        })
    )

})

const profile = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }
    const user = await User.findById(userId).select("-password -refreshToken");

    const userProfile = {
        id: user?._id,
        email: user?.email,
        role: user?.role,
        name: user?.name,
        avatar: user?.avatar,
        isActive: user?.isActive,
    }
    res.json(new ApiResponse(
        200,
        "Profile fetched successfully",
        userProfile
    ))

})

const logout = asyncHandler(async (_req, res) => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.status(200).json(new ApiResponse(200, "Logged out successfully", ""))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new ApiError(401, "Unauthorized")
    }

    const decoded = verifyRefreshToken(token)

    const payload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
    }

    const newAccessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
    }

    res.cookie("accessToken", newAccessToken, {

        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min

    })

    res.cookie("refreshToken", newRefreshToken, {

        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

    })

    res.status(200).json(new ApiResponse(200, "New access Token & refresh token generated successfully", ""))
})



export const authController = {
    register,
    login,
    profile,
    logout,
    refreshAccessToken
}