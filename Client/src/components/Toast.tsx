/**
 * Toast Component
 * Displays toast notifications for events
 */

import React from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import type { ToastNotification } from "../types";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useChatContext();

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastProps {
  toast: ToastNotification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClass = () => {
    switch (toast.type) {
      case "success":
        return "border-green-500/30";
      case "error":
        return "border-red-500/30";
      case "warning":
        return "border-yellow-500/30";
      default:
        return "border-blue-500/30";
    }
  };

  return (
    <div
      className={`glass rounded-xl p-4 border ${getColorClass()} shadow-2xl animate-slide-down min-w-[320px]`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{toast.title}</p>
          <p className="text-sm text-white/70 line-clamp-2">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
