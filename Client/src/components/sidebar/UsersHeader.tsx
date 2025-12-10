import React from "react";
import { Users } from "lucide-react";

interface Props {
  count: number;
}

const UsersHeader: React.FC<Props> = ({ count }) => {
  return (
    <div className="shrink-0 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative p-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <Users className="w-4 h-4 text-primary-400" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            )}
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm text-white">
              Connected
            </h2>
            <p className="text-xs text-white/40">
              {count} {count === 1 ? "user" : "users"} online
            </p>
          </div>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-xs font-medium text-green-400">Live</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersHeader;
