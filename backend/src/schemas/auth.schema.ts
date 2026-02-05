import {z} from "zod"

export const registerSchema = z.object({
    name: z.string().min(3,"Name must be at least 3 characters long"),
    username: z.string().min(6,"Username must be at least 6 characters long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})


export const loginSchema = z.object({
    identifier: z.string().min(6,"Identifier must be at least 6 characters long").email("Invalid email"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
})

export type RegisterSchemaType = z.infer<typeof registerSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>
