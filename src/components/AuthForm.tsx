
import React, { useState, useEffect, useRef } from "react";
import { Utensils, Loader2, Mail, Lock, CheckCircle, AlertCircle, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { API_URL } from "../constants";
import { UserSession } from "../types";
import { cn } from "../lib/utils";

interface AuthFormProps {
    onLogin: (session: UserSession) => void;
    className?: string;
    initialView?: 'login' | 'register'; // New prop
    syncAuthPath?: boolean;
}

const getDefaultRegisterData = () => ({
  firstName: "",
  lastName: "",
});

declare global {
    interface Window {
        google: any;
    }
}

// --- IMPORTANT: INLOCUIESTE AICI CU ID-UL TAU DIN GOOGLE CLOUD CONSOLE ---
// 1. Mergi la https://console.cloud.google.com/apis/credentials
// 2. Asigura-te ca la "Authorized JavaScript origins" ai pus: http://localhost:3000
const GOOGLE_CLIENT_ID = "863265667604-h5s5p9lh1cktgg2brortgset98vdla11.apps.googleusercontent.com"; 

const AuthForm = ({ onLogin, className, initialView = 'login', syncAuthPath = true }: AuthFormProps) => {
  const [isRegister, setIsRegister] = useState(initialView === 'register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerData, setRegisterData] = useState(getDefaultRegisterData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<"none" | "request" | "verify">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotInfo, setForgotInfo] = useState<string | null>(null);
  
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const updateRegisterData = <K extends keyof ReturnType<typeof getDefaultRegisterData>>(
    key: K,
    value: ReturnType<typeof getDefaultRegisterData>[K]
  ) => {
    setRegisterData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForgotState = () => {
    setForgotStep("none");
    setForgotEmail("");
    setForgotOtpCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotInfo(null);
  };

  // Update mode if prop changes
  useEffect(() => {
      setIsRegister(initialView === 'register');
      setPendingVerificationEmail(null);
      setOtpCode("");
      setOtpInfo(null);
      setRegisterData(getDefaultRegisterData());
      resetForgotState();
      setError(null);
  }, [initialView]);

  // Google Auth Initialization - Robust Re-render
  useEffect(() => {
      const renderGoogleButton = () => {
          // Check if ID is configured
          if (GOOGLE_CLIENT_ID.includes("PASTE_YOUR")) {
              console.warn("Google Client ID not configured in AuthForm.tsx");
              return;
          }

          if (window.google && window.google.accounts && googleBtnRef.current) {
              try {
                  // Initialize
                  window.google.accounts.id.initialize({
                      client_id: GOOGLE_CLIENT_ID,
                      callback: handleGoogleResponse
                  });
                  
                  // Render Button
                  // We clear innerHTML to prevent duplicate buttons if re-rendering
                  googleBtnRef.current.innerHTML = ''; 
                  window.google.accounts.id.renderButton(
                      googleBtnRef.current,
                      { 
                          theme: "outline", 
                          size: "large", 
                          width: "100%", // Adapts to container width
                          text: "continue_with",
                          shape: "rectangular",
                          logo_alignment: "left"
                      } 
                  );
              } catch (e) {
                  console.error("Google Auth Render Error:", e);
              }
          }
      };

      // Check if script is loaded
      if (!window.google?.accounts) {
          const interval = setInterval(() => {
              if (window.google?.accounts) {
                  clearInterval(interval);
                  renderGoogleButton();
              }
          }, 100);
          return () => clearInterval(interval);
      } else {
          // Script already loaded, render immediately
          renderGoogleButton();
      }
  }, [isRegister]); // Re-run when view switches to ensure button is attached to current DOM

  const handleGoogleResponse = async (response: any) => {
      setLoading(true);
      setError(null);
      try {
          const res = await fetch(`${API_URL}/google-auth`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Google login failed");
          onLogin(data);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const enterOtpFlow = (emailAddress: string, message?: string) => {
    setPendingVerificationEmail(emailAddress);
    setOtpCode("");
    setOtpInfo(message || "Am trimis codul OTP pe email. Verifică inbox-ul.");
    setError(null);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingVerificationEmail) return;
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError("Introdu un cod OTP valid din 6 cifre.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: pendingVerificationEmail, otp: otpCode.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cod OTP invalid.");

      if (data?.token) {
        onLogin(data);
        return;
      }

      setOtpInfo("Email verificat. Te poți autentifica acum.");
      setPendingVerificationEmail(null);
      setIsRegister(false);
    } catch (err: any) {
      setError(err.message || "Nu am putut valida OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingVerificationEmail) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: pendingVerificationEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nu am putut retrimite codul OTP.");
      setOtpInfo(data.message || "Cod OTP retrimis.");
    } catch (err: any) {
      setError(err.message || "Nu am putut retrimite codul OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setError("Introdu o adresa de email valida.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Nu am putut trimite codul OTP.");

      setForgotEmail(normalizedEmail);
      setForgotStep("verify");
      setForgotOtpCode("");
      setForgotInfo(data?.message || "Am trimis codul OTP de resetare pe email.");
    } catch (err: any) {
      setError(err.message || "Nu am putut trimite codul OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPasswordResetOtp = async () => {
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setError("Introdu o adresa de email valida.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Nu am putut retrimite codul OTP.");
      setForgotInfo(data?.message || "Cod OTP retrimis.");
    } catch (err: any) {
      setError(err.message || "Nu am putut retrimite codul OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setError("Adresa de email este invalida.");
      return;
    }
    if (!/^\d{6}$/.test(forgotOtpCode.trim())) {
      setError("Introdu un cod OTP valid din 6 cifre.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError("Parola noua trebuie sa aiba cel putin 6 caractere.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError("Parolele noi nu coincid.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: normalizedEmail,
          otp: forgotOtpCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Nu am putut reseta parola.");

      setEmail(normalizedEmail);
      setPassword("");
      setConfirmPassword("");
      setIsRegister(false);
      setOtpInfo(data?.message || "Parola a fost schimbata. Te poti autentifica.");
      resetForgotState();
    } catch (err: any) {
      setError(err.message || "Nu am putut reseta parola.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    // Frontend Validations
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        setError("Te rugăm să introduci o adresă de email validă.");
        setLoading(false);
        return;
    }

    if (password.length < 6) {
        setError("Parola trebuie să aibă cel puțin 6 caractere.");
        setLoading(false);
        return;
    }

    if (isRegister && password !== confirmPassword) {
        setError("Parolele nu coincid.");
        setLoading(false);
        return;
    }

    if (isRegister) {
      if (!registerData.firstName.trim() || !registerData.lastName.trim()) {
        setError("Completeaza numele si prenumele.");
        setLoading(false);
        return;
      }
    }

    const endpoint = isRegister ? '/register' : '/login';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister
            ? {
                user: normalizedEmail,
                pass: password,
                firstName: registerData.firstName.trim(),
                lastName: registerData.lastName.trim(),
              }
            : { user: normalizedEmail, pass: password }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.code === "EMAIL_NOT_VERIFIED") {
          enterOtpFlow(data?.email || normalizedEmail, data?.error);
          return;
        }
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        if (data?.requiresEmailVerification) {
          enterOtpFlow(data?.email || normalizedEmail, data?.message);
          return;
        }

        const loginRes = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: normalizedEmail, pass: password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          if (loginData?.code === "EMAIL_NOT_VERIFIED") {
            enterOtpFlow(loginData?.email || normalizedEmail, loginData?.error);
            return;
          }
          throw new Error(loginData.error || 'Authentication failed');
        }
        onLogin(loginData);
      } else {
        onLogin(data);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerificationEmail) {
    return (
      <div className={cn("flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4", className)}>
        <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shadow-inner">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Verifica Email-ul</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Am trimis codul OTP la <span className="font-semibold">{pendingVerificationEmail}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Cod OTP (6 cifre)</label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e: any) => setOtpCode(String(e.target.value || "").replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  required
                />
              </div>

              {otpInfo && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
                  {otpInfo}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base shadow-lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifica Email-ul
              </Button>

              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleResendOtp} disabled={loading}>
                  Retrimite OTP
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setPendingVerificationEmail(null);
                    setOtpCode("");
                    setOtpInfo(null);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Inapoi la Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (forgotStep !== "none") {
    return (
      <div className={cn("flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4", className)}>
        <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shadow-inner">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {forgotStep === "request" ? "Resetare Parola" : "Confirma Resetarea"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {forgotStep === "request"
                ? "Introdu emailul contului si iti trimitem codul OTP."
                : `Introdu codul OTP trimis la ${forgotEmail}.`}
            </p>
          </CardHeader>
          <CardContent>
            {forgotStep === "request" ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e: any) => setForgotEmail(e.target.value)}
                      placeholder="nume@exemplu.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Trimite codul OTP
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    resetForgotState();
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Inapoi la login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">
                    Cod OTP (6 cifre)
                  </label>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={forgotOtpCode}
                    onChange={(e: any) =>
                      setForgotOtpCode(String(e.target.value || "").replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">
                    Parola noua
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e: any) => setForgotNewPassword(e.target.value)}
                      className="pl-9"
                      placeholder="Minim 6 caractere"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">
                    Confirma parola noua
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e: any) => setForgotConfirmPassword(e.target.value)}
                      className="pl-9"
                      placeholder="Repeta parola noua"
                      required
                    />
                  </div>
                </div>

                {forgotInfo && (
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
                    {forgotInfo}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Schimba parola
                </Button>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleResendPasswordResetOtp}
                    disabled={loading}
                  >
                    Retrimite OTP
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setForgotStep("request");
                      setForgotOtpCode("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotInfo(null);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Schimba email
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4", className)}>
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shadow-inner">
            <Utensils className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{isRegister ? "Creează Cont Nou" : "Autentificare"}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {isRegister ? "Completează detaliile pentru a începe planificarea." : "Bine ai revenit în WeddingPro!"}
          </p>
        </CardHeader>
        <CardContent>
          {/* Google Button Container */}
          <div className="mb-4 w-full flex flex-col items-center justify-center min-h-[40px]">
              {GOOGLE_CLIENT_ID.includes("PASTE_YOUR") && (
                  <p className="text-[10px] text-red-500 mb-2 font-mono text-center border border-red-200 bg-red-50 p-1 w-full rounded">
                      Developer: Configurează GOOGLE_CLIENT_ID în AuthForm.tsx
                  </p>
              )}
              <div ref={googleBtnRef} className="w-full"></div>
          </div>

          <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">sau cu email</span>
              </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="nume@exemplu.com" 
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Parolă <span className="text-red-500">*</span></label>
              <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
              </div>
              {!isRegister && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => {
                      setForgotStep("request");
                      setForgotEmail(email.trim().toLowerCase());
                      setForgotOtpCode("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotInfo(null);
                      setOtpInfo(null);
                      setError(null);
                    }}
                  >
                    Ai uitat parola?
                  </button>
                </div>
              )}
            </div>

            {isRegister && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Confirmă Parola <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e: any) => setConfirmPassword(e.target.value)}
                        className={`pl-9 ${confirmPassword && confirmPassword !== password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        required
                      />
                      {confirmPassword && confirmPassword === password && (
                          <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                      )}
                  </div>
                </div>
            )}
            
            {isRegister && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Prenume *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={registerData.firstName}
                      onChange={(e: any) => updateRegisterData("firstName", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Nume *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={registerData.lastName}
                      onChange={(e: any) => updateRegisterData("lastName", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {otpInfo && !pendingVerificationEmail && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
                {otpInfo}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 animate-in shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-4 h-11 text-base shadow-lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Înregistrează-te Gratuit" : "Intră în Cont"}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">
                {isRegister ? "Ai deja un cont? " : "Nu ai cont încă? "}
              </span>
              <button
                type="button"
                className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                    setConfirmPassword("");
                    setOtpInfo(null);
                    setOtpCode("");
                    setPendingVerificationEmail(null);
                    setRegisterData(getDefaultRegisterData());
                    if (syncAuthPath) {
                      window.history.pushState({}, '', isRegister ? '/login' : '/register');
                    }
                }}
              >
                {isRegister ? "Autentifică-te" : "Creează unul acum"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
