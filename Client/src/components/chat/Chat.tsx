import React from "react";

import { useChatContext } from "../../contexts/ChatContext";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import FilePreview from "./FilePreview";
import MessageInput from "./MessageInput";

import EmptyState from "./EmptyState";
import { useChatActions } from "../../hooks/useChatActions";
import UploadProgress from "./UploadProgress";

const Chat = () => {
  const { partnerInfo, messages, leaveChat, currentRoom } = useChatContext();
  // Hook that contains all chat actions and state
  const {
    messageInput,
    setMessageInput,
    selectedFile,
    uploads,
    handleSend,
    handleFileSelect,
    fileInputRef,
    removeSelectedFile,
    cancelUpload,
  } = useChatActions();

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // No room or partner → show placeholder
  if (!currentRoom || !partnerInfo) return <EmptyState />;
  return (
    <>
      <div className="flex-1 flex flex-col h-screen w-full">
        <ChatHeader partnerInfo={partnerInfo} leaveChat={leaveChat} />

        <MessageList messages={messages} partnerInfo={partnerInfo} />

        <div className="glass border-t border-white/10">
          <UploadProgress uploads={uploads} onCancel={cancelUpload} />

          {selectedFile && (
            <FilePreview file={selectedFile} onRemove={removeSelectedFile} />
          )}

          <MessageInput
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleKeyPress={handleKeyPress}
            handleSend={handleSend}
            selectedFile={selectedFile}
            isUploading={uploads.length > 0}
            handleFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        </div>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      </div>
    </>
  );
};

export default Chat;
