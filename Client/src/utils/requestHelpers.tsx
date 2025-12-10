// English comments only

import { MessageCircle, Video, Phone } from "lucide-react";
import type { ChatRequest, CallRequest } from "../types";

export const isCallRequest = (
  request: ChatRequest | CallRequest
): request is CallRequest => {
  return "call_type" in request;
};

// Return JSX icon based on request type
export const getRequestIcon = (request: ChatRequest | CallRequest | null) => {
  if (!request) return <MessageCircle className="w-12 h-12 md:w-16 md:h-16" />;

  if (isCallRequest(request)) {
    switch (request.call_type) {
      case "video":
        return <Video className="w-12 h-12 md:w-16 md:h-16" />;
      case "audio":
        return <Phone className="w-12 h-12 md:w-16 md:h-16" />;
    }
  }
  return <MessageCircle className="w-12 h-12 md:w-16 md:h-16" />;
};

// Return gradient color
export const getRequestColor = (request: ChatRequest | CallRequest | null) => {
  if (!request) return "from-primary-500 to-accent-500";

  if (isCallRequest(request)) {
    switch (request.call_type) {
      case "video":
        return "from-accent-500 to-purple-500";
      case "audio":
        return "from-green-500 to-emerald-500";
    }
  }
  return "from-primary-500 to-accent-500";
};

// Return title text
export const getRequestTitle = (request: ChatRequest | CallRequest | null) => {
  if (!request) return "Chat Request";

  if (isCallRequest(request)) {
    switch (request.call_type) {
      case "video":
        return "Incoming Video Call";
      case "audio":
        return "Incoming Audio Call";
    }
  }
  return "Chat Request";
};

// Return message text
export const getRequestMessage = (
  request: ChatRequest | CallRequest | null
) => {
  if (!request) return "";

  if (isCallRequest(request)) {
    return `${request.from_username} wants to start a ${request.call_type} call`;
  }

  return `${request.from_username} wants to chat with you`;
};

// Return CTA button label
export const getActionText = (request: ChatRequest | CallRequest | null) => {
  if (!request) return "";

  return isCallRequest(request) ? "Answer" : "Start Chat";
};
