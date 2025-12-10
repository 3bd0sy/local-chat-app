import React from "react";

const ProfileHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
      <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
        Your Profile
      </span>
    </div>
  );
};

export default ProfileHeader;
