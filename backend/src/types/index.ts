import { Document } from "mongoose";
import { JwtPayload } from "jsonwebtoken";

/* =====================================================
   🔐 USER ROLES
===================================================== */

export type UserRole = "USER" | "ADMIN";

/* =====================================================
   👤 USER BASE INTERFACE
===================================================== */

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  // refreshToken?: string; // stored in DB (rotated)
}

/* =====================================================
   👤 USER METHODS (Instance Methods)
===================================================== */

// export interface IUserMethods {
//   isPasswordCorrect(password: string): Promise<boolean>;
//   generateAccessToken(): string;
//   generateRefreshToken(): string;
// }

/* =====================================================
   👤 USER DOCUMENT (Mongoose)
===================================================== */

export interface IUserDocument
  extends IUser,
    Document {}
     // IUserMethods {}
  

/* =====================================================
   🔐 JWT PAYLOAD TYPES
===================================================== */

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// export interface RefreshTokenPayload extends JwtPayload {
//   id: string;
// }



