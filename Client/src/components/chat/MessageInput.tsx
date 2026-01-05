import React from "react";
import { Paperclip, Smile, Send, Loader2 } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (v: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSend: () => void;
  selectedFile: File | null;
  isUploading: boolean;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  setMessageInput,
  handleKeyPress,
  handleSend,
  selectedFile,
  isUploading,
  handleFileSelect,
  fileInputRef,
}) => {
  // controls emoji list
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  data;
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 text-white/60 hover:text-white transition-all hover:scale-105 active:scale-95"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text area */}
        <div className="flex-1 relative">
          {/* emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-0 z-50">
              <Picker
                onEmojiSelect={(emoji: any) => {
                  // insert emoji into messageInput
                  setMessageInput(messageInput + emoji.native); // add selected emoji
                  setShowEmojiPicker(false); // close picker after selection
                }}
                theme="dark" // dark mode for consistency
              />
            </div>
          )}

          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500/30 focus:bg-white/10 text-white placeholder-white/40 resize-none outline-none transition-all"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-3 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
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

      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-white/30">
          Press Enter to send, Shift + Enter for new line
        </p>
        <p className="text-xs text-white/30">Max file size: 50 GB</p>
      </div>
    </div>
  );
};

export default MessageInput;
