import type { Response } from "express";
import { AuthService } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export class AuthController {
  static register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result, "User registered successfully. Please verify your email.");
  });

  static login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, "User logged in successfully");
  });

  static verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOtp(email, otp);
    return ApiResponse.success(res, result, "Email verified successfully");
  });

  static resendOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.resendOtp(email);
    return ApiResponse.success(res, result, "Verification code resent successfully");
  });

  static getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userProfile = await AuthService.getUserProfile(req.userId!);
    return ApiResponse.success(res, userProfile);
  });

  static updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userProfile = await AuthService.updateProfile(req.userId!, req.body);
    return ApiResponse.success(res, userProfile, "Profile updated successfully");
  });
}
