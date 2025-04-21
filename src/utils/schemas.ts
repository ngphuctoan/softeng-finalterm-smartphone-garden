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

export const productSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)),
    description: z.string(),
    baseSpecs: z.record(z.string().min(1))
});

export const itemSchema = z.object({
    productId: z.string().min(1),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().min(0),
    specs: z.record(z.string().min(1))
});