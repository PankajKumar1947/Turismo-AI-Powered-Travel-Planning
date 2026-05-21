import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useVerifyOtp, useResendOtp } from "@/hooks/use-auth";
import { Leaf, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle focus movement and numeric checking
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto-focus next input if a value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Must be exactly 6 digits

    const digits = pastedData.split("");
    setOtp(digits);
    setErrorMsg(null);
    inputRefs.current[5]?.focus();
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setResendStatus("sending");
    setErrorMsg(null);
    setSuccessMsg(null);

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (res) => {
          setResendStatus("success");
          setSuccessMsg(res.message || "A new verification code has been sent.");
          setCountdown(60);
        },
        onError: (err: any) => {
          setResendStatus("error");
          setErrorMsg(err.response?.data?.message || err.message || "Failed to resend code.");
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMsg("Please enter the full 6-digit verification code.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    verifyOtpMutation.mutate(
      { email, otp: code },
      {
        onSuccess: () => {
          setSuccessMsg("Email verified successfully! Redirecting you to login...");
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || err.message || "Verification failed. Please check the code.");
        },
      }
    );
  };

  const isVerifying = verifyOtpMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 t-section-bg">
      <div className="w-full max-w-md animate-fade-in">
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
            <CardTitle className="text-xl font-bold" style={{ color: "var(--t-stone-800)" }}>
              Verify Your Email
            </CardTitle>
            <CardDescription>
              We have sent a 6-digit verification code to:
              <span className="block font-semibold mt-1 text-stone-700" style={{ color: "var(--t-stone-700)" }}>
                {email}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Digits Row */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all focus:ring-2 focus:ring-forest-200 focus:border-forest-500"
                    style={{
                      background: "var(--t-surface)",
                      borderColor: "var(--t-border)",
                      color: "var(--t-stone-850)",
                    }}
                  />
                ))}
              </div>

              {/* Messaging alerts */}
              {errorMsg && (
                <div
                  className="flex items-start gap-2 text-sm rounded-xl p-3"
                  style={{
                    background: "var(--t-terra-50)",
                    color: "var(--t-terra-700)",
                    border: "1px solid var(--t-terra-200)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  className="flex items-start gap-2 text-sm rounded-xl p-3"
                  style={{
                    background: "var(--t-forest-50)",
                    color: "var(--t-forest-700)",
                    border: "1px solid var(--t-forest-200)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full t-btn-primary py-5 text-base"
                disabled={isVerifying || otp.join("").length < 6}
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Verify Code
              </Button>
            </form>

            {/* Resend actions */}
            <div className="mt-6 text-center">
              {countdown > 0 ? (
                <p className="text-sm" style={{ color: "var(--t-stone-500)" }}>
                  Resend code in <span className="font-semibold">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="text-sm transition-colors font-semibold outline-none focus:underline hover:underline cursor-pointer"
                  style={{ color: "var(--t-forest-600)" }}
                >
                  {resendStatus === "sending" ? "Resending..." : "Resend verification code"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
