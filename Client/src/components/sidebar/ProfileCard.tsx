import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import ServerInfo from "./ServerInfo";

interface Props {
  url: string;
}

const ProfileCard: React.FC<Props> = ({ url }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-sm transition-all group p-4">
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl transition-all"></div>

      <ProfileHeader />
      <ProfileInfo />
      <ServerInfo url={url} />
    </div>
  );
};

export default ProfileCard;
