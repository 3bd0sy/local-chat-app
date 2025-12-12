import React from "react";
import {
  X,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code,
  File,
} from "lucide-react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  // Get appropriate icon based on file type
  const getFileIcon = () => {
    const type = file.type;

    if (type.startsWith("image/"))
      return <Image className="w-5 h-5 text-blue-400" />;

    if (type.startsWith("video/"))
      return <Film className="w-5 h-5 text-purple-400" />;

    if (type.startsWith("audio/"))
      return <Music className="w-5 h-5 text-green-400" />;

    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return <Archive className="w-5 h-5 text-yellow-400" />;

    if (
      type.includes("javascript") ||
      type.includes("python") ||
      type.includes("json")
    )
      return <Code className="w-5 h-5 text-orange-400" />;

    if (type.includes("pdf") || type.includes("document"))
      return <FileText className="w-5 h-5 text-red-400" />;

    return <File className="w-5 h-5 text-gray-400" />;
  };

  // Format file size with appropriate units
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
        <div className="p-2 rounded-lg bg-primary-500/20">{getFileIcon()}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-white/50">{formatSize(file.size)}</p>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
