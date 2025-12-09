/**
 * Toast Component
 * Displays toast notifications for events
 */

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  XCircle,
  Bell,
} from "lucide-react";
import type { ToastNotification } from "../types";
import { useToast } from "../hooks/useToast";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <>
      {/* Desktop - Top Right */}
      <div className="hidden md:block fixed top-6 right-6 z-50 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Mobile - Top Center */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            isMobile
          />
        ))}
      </div>
    </>
  );
};

interface ToastProps {
  toast: ToastNotification;
  onClose: () => void;
  isMobile?: boolean;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose, isMobile = false }) => {
  const [progress, setProgress] = useState(100);
  const [isLeaving, setIsLeaving] = useState(false);
  const duration = toast.duration || 5000; // Default 5 seconds

  // Auto-dismiss countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / duration) * 50; // Update every 50ms
        const newProgress = prev - decrement;

        if (newProgress <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const getIcon = () => {
    const iconClass = isMobile ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6";

    switch (toast.type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-400`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-400`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-400`} />;
      default:
        return <Bell className={`${iconClass} text-primary-400`} />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-green-500/30",
          bg: "from-green-500/10 to-green-500/5",
          progress: "bg-green-500",
          glow: "shadow-green-500/20",
        };
      case "error":
        return {
          border: "border-red-500/30",
          bg: "from-red-500/10 to-red-500/5",
          progress: "bg-red-500",
          glow: "shadow-red-500/20",
        };
      case "warning":
        return {
          border: "border-yellow-500/30",
          bg: "from-yellow-500/10 to-yellow-500/5",
          progress: "bg-yellow-500",
          glow: "shadow-yellow-500/20",
        };
      case "info":
        return {
          border: "border-blue-500/30",
          bg: "from-blue-500/10 to-blue-500/5",
          progress: "bg-blue-500",
          glow: "shadow-blue-500/20",
        };
      default:
        return {
          border: "border-primary-500/30",
          bg: "from-primary-500/10 to-primary-500/5",
          progress: "bg-primary-500",
          glow: "shadow-primary-500/20",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        relative overflow-hidden
        backdrop-blur-xl bg-linear-to-br ${colors.bg}
        rounded-xl md:rounded-2xl
        border ${colors.border}
        shadow-2xl ${colors.glow}
        ${isMobile ? "min-w-0" : "min-w-[320px] max-w-sm"}
        ${isLeaving ? "animate-toast-exit" : "animate-toast-enter"}
        group
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative p-3 md:p-4">
        <div className="flex items-start gap-3">
          {/* Icon with pulse animation */}
          <div className="shrink-0 mt-0.5 relative">
            <div className="absolute inset-0 animate-pulse opacity-50 blur-sm">
              {getIcon()}
            </div>
            <div className="relative">{getIcon()}</div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="font-semibold text-sm md:text-base mb-1 text-white">
                {toast.title}
              </p>
            )}
            <p
              className={`text-xs md:text-sm text-white/70 ${
                isMobile ? "line-clamp-2" : "line-clamp-3"
              }`}
            >
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className={`h-full ${colors.progress} transition-all duration-50ms ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hover Pause Indicator */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/2 transition-colors pointer-events-none" />
    </div>
  );
};

// CSS Animations
const style = document.createElement("style");
style.textContent = `
  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toast-exit {
    from {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateX(100%) scale(0.95);
    }
  }

  .animate-toast-enter {
    animation: toast-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-toast-exit {
    animation: toast-exit 0.3s ease-out forwards;
  }

  /* Pause animations on hover */
  .group:hover .transition-all {
    transition-duration: 999999s !important;
  }
`;

if (!document.head.querySelector("style[data-toast-animations]")) {
  style.setAttribute("data-toast-animations", "true");
  document.head.appendChild(style);
}
