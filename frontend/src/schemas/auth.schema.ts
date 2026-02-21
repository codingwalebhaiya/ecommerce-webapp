import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    username: z.string().min(6, "Username must be at least 6 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    identifier: z.string(),
    password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
