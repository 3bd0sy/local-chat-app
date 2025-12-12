import { useState, useRef } from "react";
import { useChatContext } from "../contexts/ChatContext";
import { useFileUpload } from "./useFileUpload";

export const useChatActions = () => {
  // Local states
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Chat context
  const { sendMessage, currentRoom, partnerInfo } = useChatContext();
  const { uploadFile, uploads, cancelUpload } = useFileUpload();

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle sending text and file
  const handleSend = async () => {
    // Send text message
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }

    // Send file message
    if (selectedFile && currentRoom && partnerInfo) {
      // setIsUploading(true);
      const fileSize = formatFileSize(selectedFile.size);
      sendMessage(`📤 Uploading: ${selectedFile.name} (${fileSize})`);

      uploadFile(
        selectedFile,
        currentRoom,
        partnerInfo.sid,
        (fileId) => {
          sendMessage(`File sent: ${selectedFile.name}`);
          console.log("File uploaded successfully:", fileId);
        },
        (error) => {
          sendMessage(` Upload failed: ${selectedFile.name}`);
          console.error(" Upload error:", error);
        }
      );

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    }
  };

  // Select file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 50 * 1024 * 1024 * 1024) {
        alert("File size must be less than 50 GB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Remove file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    messageInput,
    setMessageInput,
    selectedFile,
    uploads,
    fileInputRef,
    handleSend,
    handleFileSelect,
    removeSelectedFile,
    cancelUpload,
  };
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
