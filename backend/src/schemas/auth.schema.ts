import {z} from "zod"

export const registerSchema = z.object({
    name: z.string().min(3,"Name must be at least 3 characters long"),
    username: z.string().min(6,"Username must be at least 6 characters long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})


export const loginSchema = z.object({
    identifier: z.string(),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
