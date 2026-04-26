import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useLogin, useRegister } from "@/hooks/use-auth";
import { Leaf, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { loginSchema, registerSchema, type AuthFormData } from "@/schemas/auth.schema";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/explore";

  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  const loginTask = useLogin();
  const registerTask = useRegister();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Reset errors and fields when switching mode
  useEffect(() => {
    reset({ name: "", email: "", password: "" });
    loginTask.reset();
    registerTask.reset();
  }, [mode, reset]);

  const isLoading = loginTask.isPending || registerTask.isPending;
  const apiError = loginTask.error?.message || registerTask.error?.message;

  const onSubmit = (data: AuthFormData) => {
    if (mode === "login") {
      loginTask.mutate(
        { email: data.email, password: data.password },
        {
          onSuccess: (res) => {
            login(res.data.token, res.data.user);
            navigate(redirectPath);
          },
        }
      );
    } else {
      registerTask.mutate(
        { name: data.name!, email: data.email, password: data.password },
        {
          onSuccess: (res) => {
            login(res.data.token, res.data.user);
            navigate(redirectPath);
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 t-section-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--t-gradient-primary)", boxShadow: "var(--t-shadow-glow)" }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold t-gradient-text">Turismo</h1>
          <p className="text-sm mt-1" style={{ color: "var(--t-stone-500)" }}>
            AI-Powered Travel Planning
          </p>
        </div>

        <Card className="t-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl" style={{ color: "var(--t-stone-800)" }}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to access your saved itineraries"
                : "Join to save and track your travel plans"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" style={{ color: "var(--t-stone-600)" }}>
                    Full Name
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "var(--t-stone-400)" }}
                    />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name")}
                      className={`pl-10 ${errors.name ? "border-terra-500" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-terra-600">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "var(--t-stone-600)" }}>
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--t-stone-400)" }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`pl-10 ${errors.email ? "border-terra-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-terra-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: "var(--t-stone-600)" }}>
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--t-stone-400)" }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Min 6 characters" : "••••••••"}
                    {...register("password")}
                    className={`pl-10 pr-10 ${errors.password ? "border-terra-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--t-stone-400)" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-terra-600">{errors.password.message}</p>}
              </div>

              {apiError && (
                <div
                  className="text-sm text-center rounded-xl p-3"
                  style={{
                    background: "var(--t-terra-50)",
                    color: "var(--t-terra-700)",
                    border: "1px solid var(--t-terra-200)",
                  }}
                >
                  {apiError}
                </div>
              )}

              <Button type="submit" className="w-full t-btn-primary py-5 text-base" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm transition-colors"
                style={{ color: "var(--t-forest-600)" }}
              >
                {mode === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
