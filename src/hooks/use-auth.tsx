import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthContext, type AuthContextType } from "@/context/auth-context";
import type { AuthResponse, RegisterResponse, VerifyOtpResponse, ResendOtpResponse } from "@/interfaces/auth.interface";
import { login, register, verifyOtp, resendOtp } from "@/routes/auth.route";

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useLogin() {
  return useMutation<AuthResponse, Error, Parameters<typeof login>[0]>({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation<RegisterResponse, Error, Parameters<typeof register>[0]>({
    mutationFn: register,
  });
}

export function useVerifyOtp() {
  return useMutation<VerifyOtpResponse, Error, Parameters<typeof verifyOtp>[0]>({
    mutationFn: verifyOtp,
  });
}

export function useResendOtp() {
  return useMutation<ResendOtpResponse, Error, Parameters<typeof resendOtp>[0]>({
    mutationFn: resendOtp,
  });
}
