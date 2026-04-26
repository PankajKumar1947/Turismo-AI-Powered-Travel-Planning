import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./auth.model";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

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
    const user = await User.create({ name, email, passwordHash });
    const token = this.signToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
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

    const token = this.signToken(user._id.toString());
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    };
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
      createdAt: user.createdAt,
    };
  }
}
