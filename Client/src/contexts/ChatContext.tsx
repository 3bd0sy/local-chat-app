/**
 * Chat context for managing application state
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useToastContext } from "../providers/ToastProvider";
import { socketService } from "../services/socketService";
import { useSocketEvents } from "../hooks/useSocketEvents";
import {
  ChatState,
  UserInfo,
  Message,
  ChatRequest,
  ConnectionEstablishedData,
  OnlineUsersData,
  ChatStartedData,
  PrivateMessageData,
  PartnerLeftData,
} from "../types";

interface ChatContextType extends ChatState {
  // Socket service
  socketService: typeof socketService;

  // User management
  setUsername: (username: string) => void;

  // Chat functions
  sendChatRequest: (targetSid: string) => void;
  acceptChatRequest: () => void;
  rejectChatRequest: () => void;
  sendMessage: (message: string) => void;
  addMessage: (message: Message) => void;
  leaveChat: () => void;

  // Connection
  disconnect: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { showToast } = useToastContext();

  // State
  const [myInfo, setMyInfo] = useState<UserInfo>({
    sid: "",
    ip: "",
    username: "",
    status: "online",
  });

  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [partnerSid, setPartnerSid] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<UserInfo | null>(null);
  const [pendingChatRequest, setPendingChatRequest] =
    useState<ChatRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  // Refs for cleanup
  const pendingRequestRef = useRef<ChatRequest | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const partnerSidRef = useRef<string | null>(null);

  // Update refs when state changes
  useEffect(() => {
    pendingRequestRef.current = pendingChatRequest;
    currentRoomRef.current = currentRoom;
    partnerSidRef.current = partnerSid;
  }, [pendingChatRequest, currentRoom, partnerSid]);

  // Helper function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ0PVqvn77BdGAg+ltryxnMpBSuBzvLZiTYIG2m98OWhUBELTKXh8bllHAU2kdb0z3kxBSh+zPLaizsKGGS56+yfSQ4NUqrn8bVnGw=="
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      // Silent fail
    }
  }, []);

  // Handle leaving chat
  const handleLeaveChat = useCallback(() => {
    // Clear all chat-related state
    setCurrentRoom(null);
    setPartnerSid(null);
    setPartnerInfo(null);
    setMessages([]);
    setPendingChatRequest(null);

    // Update user status to online
    setMyInfo((prev) => ({ ...prev, status: "online" }));
  }, []);

  // Socket event handlers
  const handleConnect = useCallback(() => {
    setTimeout(() => {
      setConnected(true);
    }, 50);
  }, []);

  const handleDisconnect = useCallback(() => {
    showToast("Disconnected", "Connection to server lost", "error");

    // setConnected(false);
    setTimeout(() => {
      setConnected(false);
    }, 100);
    showToast("Disconnected", "Connection to server lost", "error");
  }, [showToast]);

  const handleConnectionEstablished = useCallback(
    (data: ConnectionEstablishedData) => {
      setMyInfo({
        sid: data.sid,
        ip: data.ip,
        username: data.username,
        status: "online",
      });

      // Request online users list
      setTimeout(() => {
        if (socketService.isConnectedState()) {
          socketService.emit("get_online_users").catch((error) => {
            console.warn(" Failed to get online users:", error);
          });
        } else {
          console.warn(" Socket not connected, delaying get_online_users");
          setTimeout(() => {
            if (socketService.isConnectedState()) {
              socketService.emit("get_online_users").catch(() => {});
            }
          }, 500);
        }
      }, 100);
    },
    []
  );

  const handleOnlineUsersList = useCallback(
    (data: OnlineUsersData) => {
      // Filter out current user from the list
      const otherUsers = data.users.filter((user) => user.sid !== myInfo.sid);
      setOnlineUsers(otherUsers);
    },
    [myInfo.sid]
  );

  const handleIncomingChatRequest = useCallback(
    (data: ChatRequest) => {
      // Check if already has a pending request
      if (pendingRequestRef.current) {
        socketService.emit("reject_chat_request", {
          request_id: data.request_id,
        });
        return;
      }

      setPendingChatRequest(data);
      showToast("Chat Request", `${data.from_username} wants to chat`, "info");
      playNotificationSound();
    },
    [showToast, playNotificationSound]
  );

  const handleChatRequestAccepted = useCallback(
    (data: ChatStartedData) => {
      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setPartnerInfo({
        sid: data.partner_sid,
        username: data.partner_username,
        ip: data.partner_ip,
        status: "online",
      });

      setPendingChatRequest(null);
      setMessages([]);

      // Update user status to busy
      setMyInfo((prev) => ({ ...prev, status: "busy" }));

      showToast(
        "Connected",
        `Chat with ${data.partner_username} started`,
        "success"
      );
    },
    [showToast]
  );

  const handleChatStarted = useCallback(
    (data: ChatStartedData) => {
      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setPartnerInfo({
        sid: data.partner_sid,
        username: data.partner_username,
        ip: data.partner_ip,
        status: "online",
      });

      setMessages([]);

      // Update user status to busy
      setMyInfo((prev) => ({ ...prev, status: "busy" }));

      showToast(
        "Chat Started",
        `Connected with ${data.partner_username}`,
        "success"
      );
    },
    [showToast]
  );

  const handleChatRequestRejected = useCallback(
    (data: { by_username: string }) => {
      showToast(
        "Request Rejected",
        `${data.by_username} rejected the request`,
        "warning"
      );
      setPendingChatRequest(null);
    },
    [showToast]
  );

  const handleReceivePrivateMessage = useCallback(
    (data: PrivateMessageData) => {
      if (data.from_sid === myInfo.sid) {
        return;
      }
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        from_sid: data.from_sid,
        from_username: data.from_username,
        message: data.message,
        timestamp: data.timestamp,
        type: "received",
      };

      setMessages((prev) => [...prev, message]);

      // Only show toast if chat window is not focused
      if (!document.hasFocus()) {
        showToast("New Message", data.message.substring(0, 50), "info");
        playNotificationSound();
      }
    },
    [showToast, playNotificationSound, myInfo.sid]
  );

  const handlePartnerLeftChat = useCallback(
    (data: PartnerLeftData) => {
      showToast("Chat Ended", `${data.username} left the chat`, "warning");
      handleLeaveChat();
    },
    [showToast, handleLeaveChat]
  );

  // Register socket events
  useSocketEvents({
    connect: handleConnect,
    disconnect: handleDisconnect,
    connection_established: handleConnectionEstablished,
    online_users_list: handleOnlineUsersList,
    incoming_chat_request: handleIncomingChatRequest,
    chat_request_accepted: handleChatRequestAccepted,
    chat_started: handleChatStarted,
    chat_request_rejected: handleChatRequestRejected,
    receive_private_message: handleReceivePrivateMessage,
    partner_left_chat: handlePartnerLeftChat,
  });

  // User functions
  const setUsername = useCallback(
    (username: string) => {
      if (!username.trim()) {
        showToast("Error", "Username cannot be empty", "error");
        return;
      }

      if (!socketService.isConnectedState()) {
        showToast(
          "Error",
          "Cannot set username: Not connected to server",
          "error"
        );
        return;
      }

      socketService.emit("set_username", { username });
      setMyInfo((prev) => ({ ...prev, username }));

      showToast(
        "Username Updated",
        `Your username is now: ${username}`,
        "success"
      );
    },
    [showToast]
  );

  // Chat functions
  const sendChatRequest = useCallback(
    (targetSid: string) => {
      if (!targetSid) {
        showToast("Error", "Please select a user to chat with", "error");
        return;
      }

      if (currentRoomRef.current) {
        showToast("Error", "You are already in a chat", "error");
        return;
      }

      if (!socketService.isConnectedState()) {
        showToast(
          "Error",
          "Cannot send request: Not connected to server",
          "error"
        );
        return;
      }

      socketService.emit("send_chat_request", { target_sid: targetSid });
      showToast("Request Sent", "Waiting for response...", "info");
    },
    [showToast]
  );

  const acceptChatRequest = useCallback(() => {
    const request = pendingRequestRef.current;
    if (!request) {
      showToast("Error", "No pending request to accept", "error");
      return;
    }

    if (!socketService.isConnectedState()) {
      showToast(
        "Error",
        "Cannot accept request: Not connected to server",
        "error"
      );
      return;
    }

    socketService.emit("accept_chat_request", {
      request_id: request.request_id,
    });

    setPendingChatRequest(null);
  }, [showToast]);

  const rejectChatRequest = useCallback(() => {
    const request = pendingRequestRef.current;
    if (!request) {
      showToast("Error", "No pending request to reject", "error");
      return;
    }
    if (!socketService.isConnectedState()) {
      showToast(
        "Error",
        "Cannot reject request: Not connected to server",
        "error"
      );
      return;
    }

    socketService.emit("reject_chat_request", {
      request_id: request.request_id,
    });

    setPendingChatRequest(null);
  }, [showToast]);

  const sendMessage = useCallback(
    (messageText: string) => {
      const room = currentRoomRef.current;
      const currentPartnerSid = partnerSidRef.current;

      if (!room || !currentPartnerSid || !messageText.trim()) {
        showToast("Error", "Cannot send message", "error");
        return;
      }

      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      socketService
        .emit("send_private_message", {
          room_id: room,
          message: messageText,
          timestamp,
          messageId,
        } )
        .catch((error) => {
          console.error(" Failed to send message:", error);
          showToast("Error", "Failed to send message", "error");
        });

      const message: Message = {
        id: messageId,
        from_sid: myInfo.sid,
        from_username: myInfo.username,
        message: messageText,
        timestamp,
        type: "sent",
      };

      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) =>
            m.id === messageId ||
            (m.message === messageText &&
              m.from_sid === myInfo.sid &&
              m.timestamp === timestamp)
        );

        if (isDuplicate) {
          console.warn("⚠️ Duplicate message prevented:", {
            id: messageId,
            message: messageText.substring(0, 30),
          });
          return prev;
        }
        return [...prev, message];
      });
    },
    [myInfo, showToast]
  );

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const leaveChat = useCallback(() => {
    const room = currentRoomRef.current;

    if (room) {
      socketService.emit("leave_chat", { room_id: room }).catch((error) => {
        console.warn(" Failed to emit leave_chat:", error);
      });
    }

    handleLeaveChat();
    showToast("Chat Ended", "You left the chat", "info");
  }, [handleLeaveChat, showToast]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    handleLeaveChat();
    setConnected(false);
  }, [handleLeaveChat]);

  // Auto-connect on mount
  useEffect(() => {
    const connectToServer = async () => {
      try {
        await socketService.connect();
      } catch (error) {
        console.error(" Failed to auto-connect:", error);

        setTimeout(() => {
          socketService.connect().catch(() => {
            console.warn(" Second connection attempt failed");
          });
        }, 3000);
      }
    };

    connectToServer();
    return () => {
      // Only disconnect socket if this is the only provider
      // The actual cleanup will be handled by AppProvider
    };
  }, []);

  // Provide context value
  const value: ChatContextType = {
    myInfo,
    onlineUsers,
    currentRoom,
    partnerSid,
    partnerInfo,
    pendingChatRequest,
    messages,
    connected,
    socketService,
    setUsername,
    sendChatRequest,
    acceptChatRequest,
    rejectChatRequest,
    sendMessage,
    addMessage,
    leaveChat,
    disconnect,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
