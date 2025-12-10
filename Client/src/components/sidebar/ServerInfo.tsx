import React from "react";

interface Props {
  url: string;
}

const ServerInfo: React.FC<Props> = ({ url }) => {
  return (
    <div className="pt-2 border-t border-white/5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40 flex items-center gap-1.5">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
          Server
        </span>
        <code className="text-white/60 font-mono truncate">{url}</code>
      </div>
    </div>
  );
};

export default ServerInfo;
