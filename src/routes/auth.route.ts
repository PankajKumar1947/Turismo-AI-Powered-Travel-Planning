import { axiosInstance } from "../services/api";
import { authQueries } from "../react-query/auth.queries";
import { 
  type MeResponse,
  type AuthResponse,
  type RegisterResponse,
  type VerifyOtpResponse,
  type ResendOtpResponse
} from "../interfaces/auth.interface";
import {
  type RegisterRequest,
  type LoginRequest,
  type UpdateMeRequest,
} from "../schemas/auth.schema";

export async function register(data: RegisterRequest) {
  const response = await axiosInstance.post<RegisterResponse>(authQueries.register.endpoint, data);
  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await axiosInstance.post<AuthResponse>(authQueries.login.endpoint, data);
  return response.data;
}

export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await axiosInstance.post<VerifyOtpResponse>(authQueries.verifyOtp.endpoint, data);
  return response.data;
}

export async function resendOtp(data: { email: string }) {
  const response = await axiosInstance.post<ResendOtpResponse>(authQueries.resendOtp.endpoint, data);
  return response.data;
}

export async function getMe() {
  const response = await axiosInstance.get<MeResponse>(authQueries.me.endpoint);
  return response.data;
}

export async function updateMe(data: UpdateMeRequest) {
  const response = await axiosInstance.put<MeResponse>(authQueries.updateMe.endpoint, data);
  return response.data;
}
