import React from "react";
import {
  Download,
  File,
  Image,
  Film,
  Music,
  Archive,
  Code,
  FileText,
} from "lucide-react";
import apiClient from "../../api/API";

interface FileMessageProps {
  fileData: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileCategory?: string;
    fileIcon?: string;
    downloadUrl: string;
  };
  type: "sent" | "received";
}

const FileMessage: React.FC<FileMessageProps> = ({ fileData, type }) => {
  const getFileIcon = () => {
    const category = fileData.fileCategory;
    console.log(type);

    switch (category) {
      case "images":
        return <Image className="w-6 h-6" />;
      case "videos":
        return <Film className="w-6 h-6" />;
      case "audio":
        return <Music className="w-6 h-6" />;
      case "archives":
        return <Archive className="w-6 h-6" />;
      case "code":
        return <Code className="w-6 h-6" />;
      case "documents":
        return <FileText className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleDownload = async () => {
    try {
      window.open(
        `${apiClient.defaults.baseURL}${fileData.downloadUrl}`,
        "_blank"
      );
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all max-w-sm">
      <div className="p-3 rounded-lg bg-primary-500/20 text-primary-300">
        {getFileIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {fileData.fileName}
        </p>
        <p className="text-xs text-white/50">{formatSize(fileData.fileSize)}</p>
      </div>

      <button
        onClick={handleDownload}
        className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
        title="Download file"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FileMessage;
