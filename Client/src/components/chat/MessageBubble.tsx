/**
 * Message Bubble Component
 */

import { Download } from "lucide-react";
import { Message } from "../../types";
import FileMessage from "./FileMessage";

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
          {message.fileData ? (
            <FileMessage fileData={message.fileData} type={message.type} />
          ) : (
            <p className="text-sm leading-relaxed text-white break-break-word">
              {message.message}
            </p>
          )}

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

export default MessageBubble;
