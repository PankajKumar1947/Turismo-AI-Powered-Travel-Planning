import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useLogin, useRegister } from "@/hooks/use-auth";
import { Leaf, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginTask = useLogin();

  const registerTask = useRegister();

  const isLoading = loginTask.isPending || registerTask.isPending;
  const error = loginTask.error?.message || registerTask.error?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginTask.mutate({ email, password }, {
        onSuccess: (res) => {
          login(res.data.token, res.data.user);
          navigate("/explore");
        },
      });
    } else {
      registerTask.mutate({ name, email, password }, {
        onSuccess: (res) => {
          login(res.data.token, res.data.user);
          navigate("/explore");
        },
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 t-section-bg"
    >
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" style={{ color: "var(--t-stone-600)" }}>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--t-stone-400)" }} />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "var(--t-stone-600)" }}>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--t-stone-400)" }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: "var(--t-stone-600)" }}>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--t-stone-400)" }} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Min 6 characters" : "••••••••"}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={mode === "register" ? 6 : undefined}
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
              </div>

              {error && (
                <div
                  className="text-sm text-center rounded-xl p-3"
                  style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full t-btn-primary py-5 text-base"
                disabled={isLoading}
              >
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
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  loginTask.reset();
                  registerTask.reset();
                }}
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
