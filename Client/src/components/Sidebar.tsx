/**
 * Sidebar Component
 * Displays user info and list of online users with cohesive styling
 */

import React from "react";
import {
  Users,
  Wifi,
  WifiOff,
  MessageCircle,
  Video,
  Phone,
  Globe,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import type { UserInfo } from "../types";
import { useCallContext } from "../contexts/CallContext";
import { serverConfig } from "../serverConfig";

export const Sidebar: React.FC = () => {
  const { myInfo, onlineUsers, connected, sendChatRequest } = useChatContext();
  const { startCall } = useCallContext();
  const url = serverConfig.apiUrl;

  // Filter out current user and remove duplicates
  const filteredUsers = React.useMemo(() => {
    const uniqueUsers = onlineUsers.filter((user, index, self) => {
      if (user.sid === myInfo.sid) return false;
      if (user.ip === myInfo.ip && myInfo.ip) return false;

      const isFirstOccurrence =
        index === self.findIndex((u) => u.sid === user.sid);
      return isFirstOccurrence;
    });

    return uniqueUsers;
  }, [onlineUsers, myInfo.sid, myInfo.ip]);

  return (
    <div className="w-80 h-screen card flex flex-col overflow-hidden border-r border-white/10">
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-500/10 via-accent-500/5 to-transparent"></div>

        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            {/* App Logo/Title with gradient */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl text-white font-display font-bold bg-linear-to-r from-white to-white/70 bg-clip-text">
                Chat App
              </h2>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    Online
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Offline
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group">
            {/* Decorative gradient orb */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>

            <div className="relative p-4">
              {/* Profile Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Your Profile
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar with status */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg group-hover:shadow-primary-500/20 transition-shadow">
                    {myInfo.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg shadow-green-400/50 animate-pulse"></div>
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">
                      {myInfo.username}
                    </p>
                    <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
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

              {/* Server Info */}
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
                  <code className="text-white/60 font-mono truncate">
                    {url}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Users Header */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="relative p-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <Users className="w-4 h-4 text-primary-400" />
                {filteredUsers.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                )}
              </div>
              <div>
                <h2 className="font-display font-semibold text-sm text-white">
                  Connected
                </h2>
                <p className="text-xs text-white/40">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "user" : "users"} online
                </p>
              </div>
            </div>

            {/* Live Badge */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-xs font-medium text-green-400">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.sid}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <UserItem
                    user={user}
                    onChat={() => sendChatRequest(user.sid)}
                    onVideoCall={() => startCall(user.sid, "video")}
                    onAudioCall={() => startCall(user.sid, "audio")}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState: React.FC = () => (
  <div className="h-full flex items-center justify-center py-8">
    <div className="text-center space-y-4 px-4 max-w-xs">
      {/* Animated Icon */}
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Users className="w-10 h-10 text-white/30" />
        </div>
      </div>

      {/* Message */}
      <div>
        <h3 className="text-white/70 font-semibold mb-1.5">
          No one's here yet
        </h3>
        <p className="text-white/40 text-sm leading-relaxed">
          You're the first one online. Share the link to start connecting!
        </p>
      </div>

      {/* Decorative Dots */}
      <div className="flex gap-2 justify-center pt-2">
        <div
          className="w-2 h-2 rounded-full bg-white/10 animate-pulse"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-white/20 animate-pulse"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-white/10 animate-pulse"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  </div>
);

/**
 * User Item Component
 */
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
  const [showActions, setShowActions] = React.useState(false);
  const isBusy = user.in_call || user.status === "busy";

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
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
          <div
            className={`flex gap-1.5 transition-all duration-300 ${
              showActions
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
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
