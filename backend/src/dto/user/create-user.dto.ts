import { UserRole } from "../../constants/roles.js";

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    avatar?: string;
    isActive?: boolean;
    refreshToken?: string;
}


// src/dto/user/
// │
// ├── register-user.dto.ts
// ├── login-user.dto.ts
// ├── create-user.dto.ts
// ├── update-profile.dto.ts
// ├── update-user.dto.ts
// └── change-password.dto.ts