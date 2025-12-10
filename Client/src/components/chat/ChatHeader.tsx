import React from "react";
import { Video, Phone, X } from "lucide-react";
import { useCallContext } from "../../contexts/CallContext";

interface HeaderProps {
  partnerInfo: any;
  leaveChat: () => void;
}

const ChatHeader: React.FC<HeaderProps> = ({ partnerInfo, leaveChat }) => {
  const { startCall } = useCallContext();

  return (
    <div className="relative overflow-hidden glass border-b border-white/10">
      <div className="absolute inset-0 bg-linear-to-r from-primary-500/5 via-accent-500/5 to-transparent"></div>

      <div className="relative p-4">
        <div className="flex items-center justify-between">
          {/* Partner Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg">
                {partnerInfo.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                {partnerInfo.username}
              </h3>
              <p className="text-xs text-white/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Active now • {partnerInfo.ip}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => startCall(partnerInfo.sid, "video")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30 text-white transition-all hover:scale-105 active:scale-95"
              title="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>

            <button
              onClick={() => startCall(partnerInfo.sid, "audio")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 text-white transition-all hover:scale-105 active:scale-95"
              title="Start audio call"
            >
              <Phone className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1"></div>

            <button
              onClick={leaveChat}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-all hover:scale-105 active:scale-95"
              title="Leave chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
