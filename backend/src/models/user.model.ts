import mongoose, { Schema } from "mongoose";
import { IUserDocument } from "../types/index.js";


const userSchema = new Schema<IUserDocument>({
    name: {
        type: String,
        required: [false, "Name is required"],
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            "Please enter a valid email address"
        ]

    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    isActive: {
        type: Boolean,
        default: true
    }

},
    {
        timestamps: true
    }
)

const User = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema)

//const User = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema); // for nextjs point of view because nextjs work on edge runtime 

export default User 