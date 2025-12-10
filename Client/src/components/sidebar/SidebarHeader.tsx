import React from "react";
import { MessageCircle } from "lucide-react";
import ConnectionStatus from "./ConnectionStatus";
import ProfileCard from "./ProfileCard";

interface Props {
  url: string;
}

const SidebarHeader: React.FC<Props> = ({ url }) => {
  return (
    <div className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-linear-to-br from-primary-500/10 via-accent-500/5 to-transparent"></div>

      <div className="relative p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl text-white font-display font-bold bg-linear-to-r from-white to-white/70 bg-clip-text">
              Chat App
            </h2>
          </div>

          <ConnectionStatus />
        </div>

        <ProfileCard url={url} />
      </div>
    </div>
  );
};

export default SidebarHeader;
