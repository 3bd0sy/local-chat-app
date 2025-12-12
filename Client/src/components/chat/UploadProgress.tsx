import React from "react";
import {
  X,
  Pause,
  Loader2,
  CheckCircle,
  AlertCircle,
  File,
} from "lucide-react";

interface Upload {
  fileId: string;
  fileName: string;
  progress: number;
  uploadedChunks: number;
  totalChunks: number;
  status: "pending" | "uploading" | "paused" | "completed" | "error";
  speed: string;
}

interface UploadProgressProps {
  uploads: Upload[];
  onCancel: (fileId: string) => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onCancel,
}) => {
  // Don't render if no uploads
  if (uploads.length === 0) return null;

  return (
    <div className="px-4 pb-3 space-y-2">
      {uploads.map((upload) => (
        <div
          key={upload.fileId}
          className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20"
        >
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className="p-2 rounded-lg bg-primary-500/20">
              {upload.status === "uploading" && (
                <Loader2 className="w-5 h-5 text-primary-300 animate-spin" />
              )}
              {upload.status === "completed" && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {upload.status === "error" && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              {upload.status === "paused" && (
                <Pause className="w-5 h-5 text-yellow-400" />
              )}
              {upload.status === "pending" && (
                <File className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Upload Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {upload.fileName}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>
                  {upload.uploadedChunks} / {upload.totalChunks} chunks
                </span>
                <span>•</span>
                <span>{upload.speed}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary-500 to-accent-500 transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>

              <p className="text-xs text-white/40 mt-1">{upload.progress}%</p>
            </div>

            {/* Cancel Button */}
            {upload.status !== "completed" && (
              <button
                onClick={() => onCancel(upload.fileId)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Cancel upload"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadProgress;
