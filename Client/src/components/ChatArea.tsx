/**
 * ChatArea Component
 * Main chat interface with messages and input
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Video, Phone, X } from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import type { Message } from "../types";

export const ChatArea: React.FC = () => {
  const {
    partnerInfo,
    messages,
    sendMessage,
    leaveChat,
    startCall,
    currentRoom,
  } = useChatContext();

  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentRoom || !partnerInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <Send className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">
            Welcome to Chat App
          </h2>
          <p className="text-white/50">
            Select a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat header */}
      <div className="glass border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary-500 to-accent-500 flex items-center justify-center font-bold">
              {partnerInfo.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{partnerInfo.username}</p>
              <p className="text-xs text-white/50">{partnerInfo.ip}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startCall(partnerInfo.sid, "video")}
              className="btn bg-white/10 hover:bg-white/20 p-2"
              title="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => startCall(partnerInfo.sid, "audio")}
              className="btn bg-white/10 hover:bg-white/20 p-2"
              title="Start audio call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={leaveChat}
              className="btn btn-danger p-2"
              title="Leave chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass border-t border-white/10 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 input"
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isSent = message.type === "sent";

  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} animate-in`}
    >
      <div className="max-w-md">
        <div
          className={`message-bubble ${
            isSent ? "message-sent" : "message-received"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
        <p
          className={`text-xs text-white/40 mt-1 ${
            isSent ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
