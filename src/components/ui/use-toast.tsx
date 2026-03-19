import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: React.ReactNode;
};

type ToastContextType = {
  toasts: ToastType[];
  toast: (props: Omit<ToastType, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 3000, action }: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration, action }]);

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};