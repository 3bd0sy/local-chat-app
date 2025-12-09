import React, { createContext, useContext, ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import type { ToastNotification } from "../types";

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (
    title: string,
    message: string,
    type?: ToastNotification["type"]
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
export { ToastContext };
