/**
 * Sidebar Component
 * Displays user info and list of online users with cohesive styling
 */

import React from "react";
import { useChatContext } from "../../contexts/ChatContext";
import { serverConfig } from "../../serverConfig";
import SidebarHeader from "./SidebarHeader";
import UsersHeader from "./UsersHeader";
import UsersList from "./UsersList";
import "./styles.css";

const Sidebar: React.FC = () => {
  const { myInfo, onlineUsers } = useChatContext();
  const url = serverConfig.apiUrl;

  const filteredUsers = React.useMemo(() => {
    const list = onlineUsers.filter((user, index, self) => {
      if (user.sid === myInfo.sid) return false;
      if (user.ip === myInfo.ip && myInfo.ip) return false;

      return index === self.findIndex((u) => u.sid === user.sid);
    });
    return list;
  }, [onlineUsers, myInfo.sid, myInfo.ip]);

  return (
    <div className="w-80 h-screen card flex flex-col overflow-hidden border-r border-white/10">
      <SidebarHeader url={url} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <UsersHeader count={filteredUsers.length} />
        <div className="px-4 py-2">
          <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        <UsersList users={filteredUsers} />
      </div>
    </div>
  );
};

export default Sidebar;
