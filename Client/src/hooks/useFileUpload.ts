import { useState, useRef, useCallback, useEffect } from "react";
import apiClient from "../api/API";
import { useChatContext } from "../contexts/ChatContext";

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  uploadedChunks: number;
  totalChunks: number;
  status: "pending" | "uploading" | "paused" | "completed" | "error";
  speed: string; // e.g., "2.5 MB/s"
}

const CHUNK_SIZE = 1024 * 1024; // 1 MB per chunk

export const useFileUpload = () => {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(
    new Map()
  );

  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const uploadedChunks = useRef<Map<string, Set<number>>>(new Map());
  const { socketService, addMessage, partnerInfo } = useChatContext();

  useEffect(() => {
    if (!socketService) return;

    const handleFileReceived = (data: any) => {
      console.log("📥 File received from partner:", data);
      const fileMessage = {
        id: `file-${Date.now()}`,
        from_sid: data.from_sid || "partner",
        from_username: partnerInfo?.username || "Partner",
        message: "", // Empty because it's a file
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "received" as const,
        fileData: {
          fileId: data.fileId,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          fileCategory: data.fileCategory,
          fileIcon: data.fileIcon,
          downloadUrl: data.downloadUrl,
        },
      };
      addMessage(fileMessage);
    };

    socketService.on("file_received", handleFileReceived);

    return () => {
      socketService.off("file_received", handleFileReceived);
    };
  }, [socketService, addMessage, partnerInfo]);

  // Start file upload
  const uploadFile = useCallback(
    async (
      file: File,
      roomId: string,
      partnerSid: string,
      onComplete?: (fileId: string) => void,
      onError?: (error: string) => void
    ) => {
      const fileId = `file-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // Initialize upload state
      setUploads((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          uploadedChunks: 0,
          totalChunks,
          status: "uploading",
          speed: "0 KB/s",
        });
        return newMap;
      });

      // Create abort controller for cancellation
      const abortController = new AbortController();
      abortControllers.current.set(fileId, abortController);
      uploadedChunks.current.set(fileId, new Set());

      const startTime = Date.now();
      let uploadedBytes = 0;

      try {
        // Send metadata first
        await apiClient.post(
          "/api/files/init",
          {
            fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            totalChunks,
            roomId,
            partnerSid,
          },
          { signal: abortController.signal }
        );

        // Upload chunks
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          // Check for cancellation
          if (abortController.signal.aborted) {
            throw new Error("Upload cancelled");
          }

          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append("fileId", fileId);
          formData.append("chunkIndex", chunkIndex.toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("chunk", chunk);

          // Upload chunk with retry logic
          let retries = 3;
          while (retries > 0) {
            try {
              await apiClient.post("/api/files/upload-chunk", formData, {
                signal: abortController.signal,
                headers: { "Content-Type": "multipart/form-data" },
              });

              uploadedBytes += chunk.size;
              uploadedChunks.current.get(fileId)?.add(chunkIndex);

              // Calculate speed and progress
              const elapsedSeconds = (Date.now() - startTime) / 1000;
              const speed = uploadedBytes / elapsedSeconds;
              const progress = ((chunkIndex + 1) / totalChunks) * 100;

              setUploads((prev) => {
                const newMap = new Map(prev);
                const current = newMap.get(fileId);
                if (current) {
                  newMap.set(fileId, {
                    ...current,
                    progress: Math.round(progress),
                    uploadedChunks: chunkIndex + 1,
                    speed: formatSpeed(speed),
                  });
                }
                return newMap;
              });

              break; // Upload successful
            } catch (error: any) {
              retries--;
              if (retries === 0) throw error;
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        // Complete upload
        await apiClient.post(
          "/api/files/complete",
          { fileId, roomId, partnerSid },
          { signal: abortController.signal }
        );

        setUploads((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(fileId);
          if (current) {
            newMap.set(fileId, {
              ...current,
              status: "completed",
              progress: 100,
            });
          }
          return newMap;
        });

        onComplete?.(fileId);

        // Cleanup after 3 seconds
        setTimeout(() => {
          setUploads((prev) => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
          });
          abortControllers.current.delete(fileId);
          uploadedChunks.current.delete(fileId);
        }, 3000);
      } catch (error: any) {
        console.error("Upload error:", error);

        setUploads((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(fileId);
          if (current) {
            newMap.set(fileId, { ...current, status: "error" });
          }
          return newMap;
        });

        onError?.(error.message || "Upload failed");
      }
    },
    []
  );

  // Pause upload
  const pauseUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort("Upload paused");
      setUploads((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, { ...current, status: "paused" });
        }
        return newMap;
      });
    }
  }, []);

  // Cancel upload
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);

    if (controller) {
      controller.abort("Upload cancelled");
    }

    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });

    abortControllers.current.delete(fileId);
    uploadedChunks.current.delete(fileId);
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    uploadFile,
    pauseUpload,
    cancelUpload,
  };
};

// Helper function to format speed
function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
  if (bytesPerSecond < 1024 * 1024)
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
}

export const getSupportedFileTypes = async () => {
  try {
    const response = await apiClient.get("/api/files/supported-types");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch supported types:", error);
    return null;
  }
};
