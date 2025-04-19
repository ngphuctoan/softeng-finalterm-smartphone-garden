import { z } from "zod";

const userSchema = z.object({
    name: z.string().regex(/^[\p{L}\p{N} -]+$/u, "Invalid name.").min(1),
    email: z.string().email("Invalid email.").min(1)
});

export const passwordSchema = z.object({
    password: z.string().min(8, "Password too short.")
});

export const registerSchema = userSchema.extend(passwordSchema.shape);
export const updateSchema = userSchema.partial().strict();

export const roleSchema = z.object({
    role: z.string().min(1)
});