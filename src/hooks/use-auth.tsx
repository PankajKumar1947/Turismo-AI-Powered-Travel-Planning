import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthContext, type AuthContextType } from "@/context/auth-context";
import type { AuthResponse } from "@/interfaces/auth.interface";
import { login, register } from "@/routes/auth.route";

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
  return useMutation<AuthResponse, Error, Parameters<typeof register>[0]>({
    mutationFn: register,
  });
}
