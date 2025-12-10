import React from "react";
import { X, Image as ImageIcon, FileText } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
        <div className="p-2 rounded-lg bg-primary-500/20">
          {file.type.startsWith("image/") ? (
            <ImageIcon className="w-5 h-5 text-primary-300" />
          ) : (
            <FileText className="w-5 h-5 text-primary-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-white/50">
            {(file.size / 1024).toFixed(1)} KB
          </p>
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
