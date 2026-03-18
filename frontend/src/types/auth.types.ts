export type UserRole = "USER" | "ADMIN";


export interface User {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface LoginInput {
  identifier: string; // email or username
  password: string;
}

export interface RegisterInput {
  name?: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}