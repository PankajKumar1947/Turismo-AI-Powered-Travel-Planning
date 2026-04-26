import { axiosInstance } from "../services/api";
import { authQueries } from "../react-query/auth.queries";
import { 
  type MeResponse,
  type AuthResponse
} from "../interfaces/auth.interface";
import {
  type RegisterRequest,
  type LoginRequest,
  type UpdateMeRequest,
} from "../schemas/auth.schema";

export async function register(data: RegisterRequest) {
  const response = await axiosInstance.post<AuthResponse>(authQueries.register.endpoint, data);
  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await axiosInstance.post<AuthResponse>(authQueries.login.endpoint, data);
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
