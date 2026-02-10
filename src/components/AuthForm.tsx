
import React, { useState } from "react";
import { Utensils, Loader2, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { API_URL } from "../constants";
import { UserSession } from "../types";
import { cn } from "../lib/utils";

const AuthForm = ({ onLogin, className }: { onLogin: (session: UserSession) => void, className?: string }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend Validations
    if (!email || !isValidEmail(email)) {
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

    const endpoint = isRegister ? '/register' : '/login';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: email, pass: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        // Auto login after register
        const loginRes = await fetch(`${API_URL}/login`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ user: email, pass: password })
        });
        const loginData = await loginRes.json();
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
