import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./auth.model";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { EmailService } from "../../services/email.service";

const SALT_ROUNDS = 10;

export class AuthService {
  static signToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
  }

  static async register(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email,
      passwordHash,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpiry,
    });

    // Send the verification OTP email
    await EmailService.sendOtpEmail(email, name, otp);

    return {
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  static async login(data: { email: string; password: any }) {
    const { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Check if verified
    if (!user.isVerified) {
      throw ApiError.forbidden("Email is not verified. Please verify your email using the OTP.");
    }

    const token = this.signToken(user._id.toString());
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  }

  static async verifyOtp(email: string, otp: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isVerified) {
      return { success: true, message: "Email is already verified" };
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      throw ApiError.badRequest("No OTP verification request found. Please request a new one.");
    }

    if (user.verificationOtpExpires.getTime() < Date.now()) {
      throw ApiError.badRequest("OTP verification code has expired. Please request a new one.");
    }

    if (user.verificationOtp !== otp) {
      throw ApiError.badRequest("Invalid OTP verification code");
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    return { success: true, message: "Email verified successfully" };
  }

  static async resendOtp(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isVerified) {
      throw ApiError.conflict("Email is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await EmailService.sendOtpEmail(user.email, user.name, otp);

    return { success: true, message: "OTP verification code resent successfully" };
  }

  static async getUserProfile(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  static async updateProfile(userId: string, data: any) {
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      select: "-passwordHash",
    });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
