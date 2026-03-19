import React from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "./use-toast";
import { cn } from "../../lib/utils";

export const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[350px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full duration-300",
            // Variants
            t.variant === "default" && "bg-background text-foreground border-border",
            t.variant === "destructive" && "destructive group border-destructive bg-destructive text-destructive-foreground",
            t.variant === "success" && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
            t.variant === "warning" && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100"
          )}
        >
          {t.variant === "success" ? (
             <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
          ) : t.variant === "destructive" ? (
             <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : t.variant === "warning" ? (
             <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          ) : (
             <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          )}

          <div className="grid gap-1 flex-1">
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
            {t.action && <div className="mt-2">{t.action}</div>}
          </div>

          <button
            onClick={() => dismiss(t.id)}
            className="absolute right-2 top-2 rounded-md p-1 opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};