import React, { useRef, useEffect, useMemo } from "react";
import MessageBubble from "./MessageBubble";
import { Send } from "lucide-react";

interface MessageListProps {
  messages: any[];
  partnerInfo: any;
}

const MessageList: React.FC<MessageListProps> = ({ messages, partnerInfo }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages and ensure unique keys
  const processedMessages = useMemo(() => {
    return messages.map((msg, index) => ({
      ...msg,
      _uniqueKey:
        msg.id ||
        `msg-${index}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 5)}`,
      _timestamp: msg.timestamp || new Date().toISOString(),
    }));
  }, [messages]);

  return (
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
          {processedMessages.map((msg) => (
            <MessageBubble key={msg._uniqueKey} message={msg} />
          ))}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
