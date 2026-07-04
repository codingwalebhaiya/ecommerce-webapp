import { Document } from "mongoose";

import { UserRole } from "../constants/roles.js";

export interface IUser {
  name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}


// ✅ This is the Mongoose Document interface
export interface IUserDocument extends IUser, Document {}