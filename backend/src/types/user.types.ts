import { Types , Document} from "mongoose";

export type UserRole = "USER" | "ADMIN";

export interface IUser {
   name: string;
   username: string;
   email: string;
   password: string;
   role?: UserRole;
   isVerified?: boolean
}

export interface IUserDocument extends IUser, Document {
   _id: Types.ObjectId
   createdAt: Date
   updatedAt: Date

}

export interface IUserResponse {
   _id: Types.ObjectId;
   name?: string;
   username: string;
   email: string;
   role: UserRole;
   isVerified: boolean
}


