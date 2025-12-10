import React from "react";
import { useChatContext } from "../../contexts/ChatContext";
import { useCallContext } from "../../contexts/CallContext";
import UserItem from "./UserItem";
import EmptyState from "./EmptyState";

interface Props {
  users: any[];
}

const UsersList: React.FC<Props> = ({ users }) => {
  const { sendChatRequest } = useChatContext();
  const { startCall } = useCallContext();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {users.map((user, index) => (
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
  );
};

export default UsersList;
