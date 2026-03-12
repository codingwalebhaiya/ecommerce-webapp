import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { loginService, registerService } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyRefreshToken } from "../utils/jwt.js";


const register = asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body)
    const user = await registerService(validatedData);

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        })
    );

})

const login = asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);
    const ip = req.ip ?? "unknown";
    const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : (req.headers["user-agent"] ?? "unknown");
    const { user, accessToken, refreshToken } = await loginService(validatedData, ip, userAgent);

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
            maxAge: 7 * 60 * 60 * 1000, // 7 days
        }
    )

    res.status(200).json(
        new ApiResponse(200, "Login successfully", {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
        })
    )

})

const profile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }
    const user = await User.findById(userId).select("-password");
    res.json(new ApiResponse(200, "Profile fetched successfully", user))

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

    const hashedToken = hashRefreshToken(token)
    const session = await Session.findOne({
        user: decoded.id,
        refreshToken: hashedToken
    })

    if (!session) throw new ApiError(401, "Session expired")

    const payload = {
        id: decoded.id,
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
        maxAge: 15 * 60 * 1000, // 15 min

    })

    res.status(200).json(new ApiResponse(200, "New access Token & refresh token generated successfully", ""))
})



export { register, login, profile, logout, refreshAccessToken }