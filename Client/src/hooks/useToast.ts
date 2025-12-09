import { useState, useCallback } from "react";
import type { ToastNotification } from "../types";

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: ToastNotification["type"] = "info"
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastNotification = {
        id,
        title,
        message,
        type,
        duration: 3000,
      };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};
