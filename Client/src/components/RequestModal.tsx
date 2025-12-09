import React, { useEffect, useState, useMemo } from "react";
import {
  MessageCircle,
  Video,
  Phone,
  Check,
  X,
  Clock,
  Globe,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import { useCallContext } from "../contexts/CallContext";
import type { CallRequest, ChatRequest } from "../types";

const isCallRequest = (
  request: ChatRequest | CallRequest
): request is CallRequest => {
  return "call_type" in request;
};

export const RequestModal: React.FC = () => {
  const { pendingChatRequest, acceptChatRequest, rejectChatRequest } =
    useChatContext();
  const { pendingCallRequest, acceptCall, rejectCall } = useCallContext();

  const [timeLeft, setTimeLeft] = useState(30);
  const [isVisible, setIsVisible] = useState(false);

  const currentRequest = useMemo(() => {
    return pendingCallRequest || pendingChatRequest;
  }, [pendingCallRequest, pendingChatRequest]);

  const requestType = useMemo(() => {
    if (!currentRequest) return null;
    return "call_type" in currentRequest ? "call" : "chat";
  }, [currentRequest]);

  const handleAccept = () => {
    if (requestType === "call") {
      acceptCall();
    } else if (requestType === "chat") {
      acceptChatRequest();
    }
  };

  const handleReject = () => {
    if (requestType === "call") {
      rejectCall();
    } else if (requestType === "chat") {
      rejectChatRequest();
    }
  };

  useEffect(() => {
    if (currentRequest) {
      setIsVisible(true);
      setTimeLeft(30);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleReject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentRequest]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentRequest) return;

      if (e.key === "Enter") {
        handleAccept();
      } else if (e.key === "Escape") {
        handleReject();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentRequest, handleAccept, handleReject]);

  if (!currentRequest || !isVisible) {
    return null;
  }

  const getIcon = () => {
    if (requestType === "call" && isCallRequest(currentRequest)) {
      const callRequest = currentRequest as CallRequest;
      switch (callRequest.call_type) {
        case "video":
          return <Video className="w-12 h-12 md:w-16 md:h-16" />;
        case "audio":
          return <Phone className="w-12 h-12 md:w-16 md:h-16" />;
      }
    }
    return <MessageCircle className="w-12 h-12 md:w-16 md:h-16" />;
  };

  const getIconColor = () => {
    if (requestType === "call" && isCallRequest(currentRequest)) {
      const callRequest = currentRequest as CallRequest;
      switch (callRequest.call_type) {
        case "video":
          return "from-accent-500 to-purple-500";
        case "audio":
          return "from-green-500 to-emerald-500";
      }
    }
    return "from-primary-500 to-accent-500";
  };

  const getTitle = () => {
    if (requestType === "call" && isCallRequest(currentRequest)) {
      const callRequest = currentRequest as CallRequest;
      switch (callRequest.call_type) {
        case "video":
          return "Incoming Video Call";
        case "audio":
          return "Incoming Audio Call";
      }
    }
    return "Chat Request";
  };

  const getMessage = () => {
    if (requestType === "call" && isCallRequest(currentRequest)) {
      const callRequest = currentRequest as CallRequest;
      return `${callRequest.from_username} wants to start a ${callRequest.call_type} call`;
    }
    return `${currentRequest.from_username} wants to chat with you`;
  };

  const getActionText = () => {
    return requestType === "call" ? "Answer" : "Start Chat";
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={handleReject}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`absolute inset-0 bg-linear-to-r ${getIconColor()} opacity-20 blur-3xl rounded-3xl`}
          ></div>

          <div className="relative glass rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }}
              ></div>
            </div>

            <div className="relative p-6 md:p-8">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className={`h-full bg-linear-to-r ${getIconColor()} transition-all duration-1000 ease-linear`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>

              <button
                onClick={handleReject}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-110 active:scale-95"
                title="Reject (Esc)"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full bg-linear-to-r ${getIconColor()} opacity-75 animate-ping`}
                  ></div>
                  <div
                    className={`absolute inset-0 rounded-full bg-linear-to-r ${getIconColor()} opacity-50 blur-xl`}
                  ></div>

                  <div
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br ${getIconColor()} flex items-center justify-center shadow-2xl`}
                  >
                    <div className="text-white">{getIcon()}</div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-2 bg-linear-to-r from-white to-white/80 bg-clip-text text-transparent">
                {getTitle()}
              </h2>

              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${getIconColor()} flex items-center justify-center font-bold text-lg shadow-lg`}
                  >
                    {currentRequest.from_username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-lg truncate">
                      {currentRequest.from_username}
                    </p>
                    <p className="text-sm text-white/50">{getMessage()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <code className="font-mono">{currentRequest.from_ip}</code>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}s remaining</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 py-4 px-6 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="relative flex items-center justify-center gap-2 text-white/80 group-hover:text-white">
                    <X className="w-5 h-5" />
                    <span className="font-semibold">Reject</span>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  onClick={handleAccept}
                  className="flex-1 group relative overflow-hidden rounded-xl bg-linear-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 py-4 px-6 shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="relative flex items-center justify-center gap-2 text-white font-semibold">
                    <Check className="w-5 h-5" />
                    <span>{getActionText()}</span>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-white/30">
                  Press{" "}
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono">
                    Enter
                  </kbd>{" "}
                  to accept or{" "}
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono">
                    Esc
                  </kbd>{" "}
                  to reject
                </p>
              </div>
            </div>

            <div className={`h-1 bg-linear-to-r ${getIconColor()}`}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        kbd {
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        body:has(.request-modal-open) {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};
