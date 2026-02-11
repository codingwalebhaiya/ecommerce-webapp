import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import ApiResponse from "../utils/ApiResponse.js"

const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body)

    const existingUser = await User.findOne(
        {
            $or: [{ email: data.email }, { username: data.username }]
        }
    )

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await User.create({
        ...data,
        password: hashedPassword
    })


    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", {
            id: user._id,
            username: user.username,
            email: user.email,
        })
    );

})

const login = asyncHandler(async (req, res) => {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await User.findOne(
        {
            $or: [{ email: identifier }, { username: identifier }]
        }
    ).select("+password")

    if (!user) {
        throw new ApiError(400, "Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    }

    

    const accessToken = generateAccessToken(payload)
    

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
    }

    return res.cookie("accessToken", accessToken,
        {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 min

        }
    ).json(
        new ApiResponse(200, "Login successfully", {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        })
    )

})



export { register, login }