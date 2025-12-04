/**
 * Sidebar Component
 * Displays user info and list of online users
 */

import React from "react";
import {
  Users,
  Wifi,
  WifiOff,
  MessageCircle,
  Video,
  Phone,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import type { UserInfo } from "../types";

export const Sidebar: React.FC = () => {
  const { myInfo, onlineUsers, connected, sendChatRequest, startCall } =
    useChatContext();

  // Filter out current user and remove duplicates
  const filteredUsers = React.useMemo(() => {
    console.log("🔍 ========================================");
    console.log("🔍 FILTERING USERS");
    console.log("🔍 ========================================");
    console.log("🔍 My SID:", myInfo.sid);
    console.log("🔍 My IP:", myInfo.ip);
    console.log("🔍 Total users from server:", onlineUsers.length);
    console.log(
      "🔍 Users list:",
      onlineUsers.map((u) => ({
        sid: u.sid,
        username: u.username,
        ip: u.ip,
      }))
    );
    return onlineUsers;

    // Remove current user and duplicates
    const uniqueUsers = onlineUsers.filter((user, index, self) => {
      // Exclude current user by SID
      if (user.sid === myInfo.sid) {
        console.log("🔍 ❌ Excluding current user (by SID):", user.sid);
        return false;
      }

      // Exclude current user by IP (fallback)
      if (user.ip === myInfo.ip && myInfo.ip) {
        console.log("🔍 ❌ Excluding current user (by IP):", user.ip);
        return false;
      }

      // Keep only first occurrence (remove duplicates by SID)
      const isFirstOccurrence =
        index === self.findIndex((u) => u.sid === user.sid);
      if (!isFirstOccurrence) {
        console.log("🔍 ❌ Excluding duplicate user:", user.sid);
      }
      return isFirstOccurrence;
    });

    console.log("🔍 ========================================");
    console.log("🔍 FILTERING RESULTS:");
    console.log("🔍 Before:", onlineUsers.length);
    console.log("🔍 After:", uniqueUsers.length);
    console.log("🔍 Removed:", onlineUsers.length - uniqueUsers.length);
    console.log(
      "🔍 Filtered users:",
      uniqueUsers.map((u) => ({
        sid: u.sid,
        username: u.username,
        ip: u.ip,
      }))
    );
    console.log("🔍 ========================================");

    return uniqueUsers;
  }, [onlineUsers, myInfo.sid, myInfo.ip]);

  return (
    <div className="w-80 h-screen card flex flex-col overflow-hidden border-r border-white/10">
      {/* Header with user info */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold bg-linear-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Chat App
          </h1>
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400 animate-pulse" />
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary-500 to-accent-500 flex items-center justify-center font-bold">
              {myInfo.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{myInfo.username}</p>
              <p className="text-sm text-white/50">{myInfo.ip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Online users list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-400" />
          <h2 className="font-display font-semibold text-lg">
            Online Users ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No other users online</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <UserItem
                key={user.sid}
                user={user}
                onChat={() => sendChatRequest(user.sid)}
                onVideoCall={() => startCall(user.sid, "video")}
                onAudioCall={() => startCall(user.sid, "audio")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
    <div className="glass rounded-xl p-4 hover:bg-white/10 transition-all duration-200 animate-in">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
              isBusy ? "bg-yellow-500" : "bg-green-500"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.username}</p>
          <p className="text-xs text-white/50 truncate">{user.ip}</p>
          {isBusy && <p className="text-xs text-yellow-400 mt-1">In call</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onChat}
          disabled={isBusy}
          className="flex-1 btn btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Start chat"
        >
          <MessageCircle className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={onVideoCall}
          disabled={isBusy}
          className="flex-1 btn bg-white/10 hover:bg-white/20 text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Video call"
        >
          <Video className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={onAudioCall}
          disabled={isBusy}
          className="flex-1 btn bg-white/10 hover:bg-white/20 text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Audio call"
        >
          <Phone className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
};
