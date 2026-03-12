import { UserRole } from "./user.types.js";

// JWT PAYLOAD TYPES 
export interface AccessTokenPayload {
   id: string;
   email: string;
   role: UserRole;
}

export interface RefreshTokenPayload {
   id: string;
   email: string;
   role: UserRole;
}