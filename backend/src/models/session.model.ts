import mongoose, { Schema } from "mongoose"
import { ISessionDocument } from "../types/session.types.js"

const sessionSchema = new Schema<ISessionDocument>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        refreshToken: {
            type: String,
            required: true
        },

        userAgent: String,

        ip: String,

        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
)

const Session =
    mongoose.models.Session ||
    mongoose.model<ISessionDocument>("Session", sessionSchema)

export default Session