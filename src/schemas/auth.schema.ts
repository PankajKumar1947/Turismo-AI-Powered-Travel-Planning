import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateSchema = z.object({
  name: z.string().min(2).optional(),
  preferences: z.object({
    categories: z.array(z.string()).optional(),
    budgetRange: z.string().optional(),
  }).optional(),
});

export type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UpdateMeRequest = z.infer<typeof updateSchema>;
