// Handles message sending, file selection, removal, and upload state logic

import { useState, useRef } from "react";
import { useChatContext } from "../contexts/ChatContext";
// import { useChatContext } from "../../../contexts/ChatContext";

export const useChatActions = () => {
  // Local states
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Chat context
  const { sendMessage } = useChatContext();

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
    if (selectedFile) {
      setIsUploading(true);

      try {
        console.log("Uploading file:", selectedFile.name);
        sendMessage(`📎 Sent file: ${selectedFile.name}`);
        setSelectedFile(null);
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Select file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
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
    isUploading,
    fileInputRef,
    handleSend,
    handleFileSelect,
    removeSelectedFile,
  };
};
