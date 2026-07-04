export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    avatar?: string;
    isActive?: boolean;
    refreshToken?: string;
}