import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  preferences: z
    .object({
      categories: z.array(z.string()).optional(),
      budgetRange: z.string().optional(),
    })
    .optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type UpdateProfileDTO = z.infer<typeof updateSchema>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>;
export type ResendOtpDTO = z.infer<typeof resendOtpSchema>;

