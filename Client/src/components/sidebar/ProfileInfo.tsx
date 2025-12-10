import React from "react";
import { Globe } from "lucide-react";
import { useChatContext } from "../../contexts/ChatContext";

const ProfileInfo: React.FC = () => {
  const { myInfo } = useChatContext();

  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg">
          {myInfo.username.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-white truncate">{myInfo.username}</p>
          <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            You
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-white/40" />
          <code className="text-xs text-white/50 font-mono truncate">
            {myInfo.ip}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
