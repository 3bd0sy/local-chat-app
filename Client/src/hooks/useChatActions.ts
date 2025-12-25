import { useState, useRef, useCallback } from "react";
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

  // Helper function to generate unique ID
  const generateUniqueId = useCallback((prefix: string = "file") => {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }, []);

  // Handle sending text and file
  const handleSend = async () => {
    // Send text message
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }

    // Send file message
    if (selectedFile && currentRoom && partnerInfo) {
      const uploadId = generateUniqueId("upload");
      const fileUniqueId = generateUniqueId("file");
      const fileMessageId = `file-msg-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const fileWithId = Object.assign(selectedFile, {
        uniqueId: fileUniqueId,
        uploadId,
        messageId: fileMessageId,
      });
      const existingUpload = uploads.find((u) => u.uploadId === uploadId);
      if (existingUpload) {
        console.warn("⚠️ Upload with same ID already exists:", uploadId);
        return;
      }
      uploadFile(
        fileWithId,
        currentRoom,
        partnerInfo.sid,
        uploadId,
        () => {
          console.log("✅ File upload completed successfully");
        },
        (error) => {
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

      // Add unique identifier to file
      const fileWithId = Object.assign(file, {
        uniqueId: generateUniqueId("file"),
        selectedAt: Date.now(),
      });

      setSelectedFile(fileWithId);
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
