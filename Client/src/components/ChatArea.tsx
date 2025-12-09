/**
 * ChatArea Component
 * Main chat interface with messages, input, and file sharing
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Video,
  Phone,
  X,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Loader2,
  Smile,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import type { Message } from "../types";
import { useCallContext } from "../contexts/CallContext";

export const ChatArea: React.FC = () => {
  const {
    partnerInfo,
    messages,
    sendMessage,
    leaveChat,
    currentRoom,
  } = useChatContext();

  const { startCall } = useCallContext();
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }

    // Handle file upload if file is selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        // TODO: Implement file upload logic
        // await uploadFile(selectedFile);
        console.log("Uploading file:", selectedFile.name);

        // For now, just send a message about the file
        sendMessage(`📎 Sent file: ${selectedFile.name}`);
        setSelectedFile(null);
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!currentRoom || !partnerInfo) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="relative overflow-hidden glass border-b border-white/10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/5 via-accent-500/5 to-transparent"></div>

        <div className="relative p-4">
          <div className="flex items-center justify-between">
            {/* Partner Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg">
                  {partnerInfo.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {partnerInfo.username}
                </h3>
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Active now • {partnerInfo.ip}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => startCall(partnerInfo.sid, "video")}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30 text-white transition-all hover:scale-105 active:scale-95"
                title="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                onClick={() => startCall(partnerInfo.sid, "audio")}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 text-white transition-all hover:scale-105 active:scale-95"
                title="Start audio call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <button
                onClick={leaveChat}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-all hover:scale-105 active:scale-95"
                title="Leave chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-linear-to-b from-transparent via-primary-500/[0.02] to-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Send className="w-10 h-10 text-white/30" />
                </div>
              </div>
              <div>
                <h3 className="text-white/70 font-semibold mb-1.5">
                  Start the conversation
                </h3>
                <p className="text-white/40 text-sm">
                  Send a message to {partnerInfo.username}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="glass border-t border-white/10">
        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <div className="p-2 rounded-lg bg-primary-500/20">
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon className="w-5 h-5 text-primary-300" />
                ) : (
                  <FileText className="w-5 h-5 text-primary-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-white/50">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={removeSelectedFile}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4">
          <div className="flex items-end gap-2">
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 text-white/60 hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/30 focus:bg-white/10 text-white placeholder-white/40 resize-none outline-none transition-all"
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
              />

              {/* Emoji Button (placeholder) */}
              <button
                className="absolute right-3 bottom-3 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!messageInput.trim() && !selectedFile) || isUploading}
              className="p-2.5 rounded-xl bg-linear-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white shadow-lg shadow-primary-500/20 disabled:shadow-none transition-all hover:scale-105 active:scale-95 disabled:scale-100"
              title="Send message"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Hints */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-white/30">
              Press Enter to send, Shift + Enter for new line
            </p>
            <p className="text-xs text-white/30">Max file size: 10MB</p>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      {/* Animated Icon */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-32 h-32 rounded-full bg-linear-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center">
          <Send className="w-16 h-16 text-primary-400" />
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-display font-bold mb-3 bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
        Welcome to Chat App
      </h2>
      <p className="text-white/50 text-lg mb-6">
        Select a user from the sidebar to start chatting
      </p>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Send className="w-6 h-6 text-primary-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">Instant Messages</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Video className="w-6 h-6 text-accent-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">Video Calls</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Paperclip className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">File Sharing</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isSent = message.type === "sent";
  const isFile = message.message.startsWith("📎");

  return (
    <div
      className={`flex ${
        isSent ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      <div className={`max-w-md ${isSent ? "max-w-lg" : "max-w-md"}`}>
        {/* Message Bubble */}
        <div
          className={`relative group ${
            isSent
              ? "bg-linear-to-r from-primary-500 to-accent-500 rounded-2xl rounded-tr-md"
              : "bg-white/10 rounded-2xl rounded-tl-md backdrop-blur-sm border border-white/10"
          } p-3.5 shadow-lg transition-all hover:shadow-xl`}
        >
          {/* Message Content */}
          <p className="text-sm leading-relaxed text-white break-break-word">
            {message.message}
          </p>

          {/* File Indicator (if applicable) */}
          {isFile && (
            <button className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}

          {/* Hover Effect */}
          <div
            className={`absolute inset-0 rounded-2xl ${
              isSent ? "rounded-tr-md" : "rounded-tl-md"
            } bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
          ></div>
        </div>

        {/* Timestamp */}
        <p
          className={`text-xs text-white/40 mt-1.5 px-1 ${
            isSent ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
