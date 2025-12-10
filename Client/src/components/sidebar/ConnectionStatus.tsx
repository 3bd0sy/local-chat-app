import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useChatContext } from "../../contexts/ChatContext";

const ConnectionStatus: React.FC = () => {
  const { connected } = useChatContext();

  return connected ? (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
      <Wifi className="w-4 h-4 text-green-400" />
      <span className="text-xs font-medium text-green-400">Online</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
      <WifiOff className="w-4 h-4 text-red-400" />
      <span className="text-xs font-medium text-red-400">Offline</span>
    </div>
  );
};

export default ConnectionStatus;
