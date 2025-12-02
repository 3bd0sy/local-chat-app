/**
 * RequestModal Component
 * Modal for accepting/rejecting incoming chat and call requests
 */

import React from "react";
import { MessageCircle, Video, Phone, Check, X } from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";

export const RequestModal: React.FC = () => {
  const { pendingRequest, acceptChatRequest, rejectChatRequest } =
    useChatContext();

  if (!pendingRequest) {
    return null;
  }

  const getIcon = () => {
    switch (pendingRequest.type) {
      case "video":
        return <Video className="w-16 h-16 text-primary-400" />;
      case "audio":
        return <Phone className="w-16 h-16 text-accent-400" />;
      default:
        return <MessageCircle className="w-16 h-16 text-primary-400" />;
    }
  };

  const getTitle = () => {
    switch (pendingRequest.type) {
      case "video":
        return "Incoming Video Call";
      case "audio":
        return "Incoming Audio Call";
      default:
        return "Chat Request";
    }
  };

  const getMessage = () => {
    const action =
      pendingRequest.type === "chat"
        ? "wants to chat with you"
        : `wants to start a ${pendingRequest.type} call`;
    return `${pendingRequest.from_username} (${pendingRequest.from_ip}) ${action}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card p-8 max-w-md w-full mx-4 animate-slide-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-linear-to-r from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-bold text-center mb-2">
          {getTitle()}
        </h2>

        {/* Message */}
        <p className="text-center text-white/70 mb-8">{getMessage()}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={rejectChatRequest}
            className="flex-1 btn bg-white/10 hover:bg-white/20 py-4 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>Reject</span>
          </button>
          <button
            onClick={acceptChatRequest}
            className="flex-1 btn btn-primary py-4 flex items-center justify-center gap-2 glow"
          >
            <Check className="w-5 h-5" />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
