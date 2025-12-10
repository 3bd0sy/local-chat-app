/**
 * User Item Component
 */

import React from "react";
import { Globe, MessageCircle, Phone, Video } from "lucide-react";
import { UserInfo } from "../../types";

interface UserItemProps {
  user: UserInfo;
  onChat: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onChat,
  onVideoCall,
  onAudioCall,
}) => {
  const isBusy = user.in_call || user.status === "busy";

  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-linear-to-r from-primary-500/0 via-primary-500/5 to-accent-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-200">
        {/* Content */}
        <div className="p-3.5">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar with status */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg group-hover:shadow-primary-500/20 transition-shadow">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* Status badge */}
              <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                <span
                  className={`relative flex h-3.5 w-3.5 ${
                    !isBusy && "animate-pulse"
                  }`}
                >
                  {!isBusy && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-gray-900 ${
                      isBusy ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></span>
                </span>
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary-300 transition-colors">
                  {user.username}
                </h3>
                {isBusy && (
                  <span className="shrink-0 px-1.5 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                    Busy
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Globe className="w-3 h-3" />
                <code className="font-mono truncate">{user.ip}</code>
              </div>
            </div>
          </div>

          {/* Action buttons - slide in on hover */}
          <div className="flex gap-1.5 transition-all duration-300 opacity-100 translate-y-0">
            <button
              onClick={onChat}
              disabled={isBusy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 hover:text-primary-200 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Send message"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={onVideoCall}
              disabled={isBusy}
              className="flex items-center justify-center p-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 hover:text-accent-200 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Video call"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              onClick={onAudioCall}
              disabled={isBusy}
              className="flex items-center justify-center p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Audio call"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 bg-linear-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
};

export default UserItem;
