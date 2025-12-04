/**
 * Chat context for managing application state
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { socketService } from "../services/socketService";
import { webrtcService } from "../services/webrtcService";
import type {
  AppState,
  UserInfo,
  Message,
  ChatRequest,
  CallType,
  ToastNotification,
} from "../types";

interface ChatContextType extends AppState {
  // User management
  onlineUsers: UserInfo[];
  setUsername: (username: string) => void;

  // Chat functions
  sendChatRequest: (targetSid: string) => void;
  acceptChatRequest: () => void;
  rejectChatRequest: () => void;
  sendMessage: (message: string) => void;
  leaveChat: () => void;

  // Call functions
  startCall: (targetSid: string, callType: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;

  // Messages
  messages: Message[];

  // Notifications
  toasts: ToastNotification[];
  showToast: (
    title: string,
    message: string,
    type?: ToastNotification["type"]
  ) => void;
  removeToast: (id: string) => void;

  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Connection state
  connected: boolean;
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
  // State management
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
  const [pendingRequest, setPendingRequest] = useState<ChatRequest | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callType, setCallType] = useState<CallType | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    // Remove all existing listeners first
    socket.removeAllListeners("connect");
    socket.removeAllListeners("disconnect");
    socket.removeAllListeners("connection_established");
    socket.removeAllListeners("call_accepted");
    socket.removeAllListeners("call_started");
    socket.removeAllListeners("webrtc_offer");
    socket.removeAllListeners("webrtc_answer");
    socket.removeAllListeners("webrtc_ice_candidate");

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to server, socket ID:", socket.id);
    });

    return () => {
      console.log("Component unmounting (keeping socket connected)");
    };
  }, []); // Empty dependency array

  // Debug effect for remote stream changes
  useEffect(() => {
    console.log("Remote stream changed:", {
      hasRemoteStream: !!remoteStream,
      trackCount: remoteStream?.getTracks().length || 0,
      tracks: remoteStream?.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label,
      })),
      streamId: remoteStream?.id,
      active: remoteStream?.active,
    });
  }, [remoteStream]);

  // Cleanup only on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      socketService.disconnect();
      webrtcService.cleanup();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  // Debug effect for local stream changes
  useEffect(() => {
    console.log("Local stream changed:", {
      hasLocalStream: !!localStream,
      trackCount: localStream?.getTracks().length || 0,
      tracks: localStream?.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
      })),
    });
  }, [localStream]);

  // Debug effect for peer connection state
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInCall) {
        webrtcService.debugPeerConnection("Periodic check");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isInCall]);

  // Show toast notification
  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: ToastNotification["type"] = "info"
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastNotification = {
        id,
        title,
        message,
        type,
        duration: 3000,
      };
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper function to play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ0PVqvn77BdGAg+ltryxnMpBSuBzvLZiTYIG2m98OWhUBELTKXh8bllHAU2kdb0z3kxBSh+zPLaizsKGGS56+yfSQ4NUqrn8bVnGw=="
      );
      audio.play().catch(() => {});
    } catch (error) {
      console.log("Notification sound unavailable");
    }
  };

  // Helper functions
  const handleLeaveChat = useCallback(() => {
    console.log("👋 Leaving chat, cleaning up...");
    setCurrentRoom(null);
    setPartnerSid(null);
    setPartnerInfo(null);
    setMessages([]);
  }, []);

  const handleEndCall = useCallback(() => {
    console.log("📞 Ending call, cleaning up...");
    webrtcService.cleanup();
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallType(null);
  }, []);

  const initializeCall = useCallback(
    async (
      type: CallType,
      isInitiator: boolean,
      partnerSidParam?: string,
      room_id?: string
    ) => {
      console.log("🎥 ===== INITIALIZE CALL =====");
      console.log("room_id param:", room_id);
      console.log("🎥 Type:", type, "Initiator:", isInitiator);

      try {
        setIsInCall(true);

        const effectivePartnerSid = partnerSidParam || partnerSid;
        console.log("🎥 Partner SID:", effectivePartnerSid);

        const pc = webrtcService.createPeerConnection();

        webrtcService.setOnTrackCallback((remoteStream) => {
          console.log("📡 Remote stream received in callback");
          setRemoteStream(remoteStream);
        });

        webrtcService.setOnIceCandidateCallback((candidate) => {
          if (effectivePartnerSid) {
            console.log("🧊 Sending ICE candidate");
            socketService.emit("webrtc_ice_candidate", {
              target_sid: effectivePartnerSid,
              candidate: candidate.toJSON(),
            });
          }
        });

        console.log("🎥 Requesting local stream...");
        const stream = await webrtcService.initializeLocalStream(type);
        console.log(
          " Local stream obtained, tracks:",
          stream.getTracks().length
        );

        setLocalStream(stream);

        console.log("📤 Adding tracks to peer connection...");
        stream.getTracks().forEach((track) => {
          console.log(`  Adding ${track.kind} track`);
          pc.addTrack(track, stream);
        });

        const transceivers = pc.getTransceivers();
        console.log("🔧 Configuring transceivers:", transceivers.length);
        transceivers.forEach((transceiver, index) => {
          if (transceiver.direction !== "sendrecv") {
            console.log(`  Setting transceiver ${index} to sendrecv`);
            transceiver.direction = "sendrecv";
          }
        });

        if (isInitiator) {
          console.log("📝 Creating offer...");
          const offer = await webrtcService.createOffer();
          console.log(" Offer created, sending to partner");

          socketService.emit("webrtc_offer", {
            target_sid: effectivePartnerSid,
            offer,
          });
          setTimeout(() => {
            const currentPc = webrtcService.getState().peerConnection;
            if (currentPc && !currentPc.remoteDescription) {
              console.warn("⚠️ No answer received after 10 seconds!");
              showToast("Connection Issue", "No response from peer", "warning");
            }
          }, 10000);
        } else {
          console.log("⏳ Waiting for offer from initiator");

          setTimeout(() => {
            const currentPc = webrtcService.getState().peerConnection;
            if (currentPc && !currentPc.remoteDescription) {
              console.error("❌ No offer received after 10 seconds!");
              showToast(
                "Connection Failed",
                "Did not receive connection request",
                "error"
              );
              handleEndCall();
            }
          }, 10000);
        }

        webrtcService.debugPeerConnection("After initializeCall");
        console.log(" Initialize call complete");
        showToast("Call Active", "Connected", "success");
      } catch (error) {
        console.error("❌ Error in initializeCall:", error);
        showToast("Error", "Failed to start call", "error");
        handleEndCall();
      }
    },
    [partnerSid, showToast, handleEndCall]
  );
  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on("connect", () => {
      setConnected(true);
      console.log(" Connected to server, socket ID:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      showToast("Disconnected", "Connection to server lost", "error");
    });

    // Connection established
    socketService.on("connection_established", (data) => {
      console.log("🔌 Connection established:", data);
      setMyInfo({
        sid: data.sid,
        ip: data.ip,
        username: data.username,
        status: "online",
      });
      socketService.emit("get_online_users");
    });

    // Online users list
    socketService.on("online_users_list", (data) => {
      console.log("👥 Online users received:", data.users.length);
      setOnlineUsers(data.users);
    });

    // Incoming chat request
    socketService.on("incoming_chat_request", (data) => {
      console.log("💌 Incoming chat request:", data);
      setPendingRequest(data);
      showToast("Chat Request", `${data.from_username} wants to chat`, "info");
      playNotificationSound();
    });

    // Incoming call
    socketService.on("incoming_call", (data) => {
      console.log("📞 Incoming call:", data);
      setPendingRequest(data);
      const callTypeText = data.type === "video" ? "video call" : "audio call";
      showToast(
        "Incoming Call",
        `${data.from_username} wants to ${callTypeText}`,
        "info"
      );
      playNotificationSound();
    });

    // Chat request accepted
    socketService.on("chat_request_accepted", (data) => {
      console.log("🤝 Chat request accepted:", data);
      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setPartnerInfo({
        sid: data.partner_sid,
        username: data.partner_username,
        ip: data.partner_ip,
        status: "online",
      });
      showToast(
        "Connected",
        `Chat with ${data.partner_username} started`,
        "success"
      );
    });

    // Chat started
    socketService.on("chat_started", (data) => {
      console.log("💬 Chat started:", data);
      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setPartnerInfo({
        sid: data.partner_sid,
        username: data.partner_username,
        ip: data.partner_ip,
        status: "online",
      });
      showToast(
        "Chat Started",
        `Connected with ${data.partner_username}`,
        "success"
      );
    });

    // Chat request rejected
    socketService.on("chat_request_rejected", (data) => {
      console.log("❌ Chat request rejected:", data);
      showToast(
        "Request Rejected",
        `${data.by_username} rejected the request`,
        "warning"
      );
      setPendingRequest(null);
    });

    // Receive message
    socketService.on("receive_private_message", (data) => {
      console.log("💬 Received message:", data);
      const message: Message = {
        id: `msg-${Date.now()}`,
        from_sid: data.from_sid,
        from_username: data.from_username,
        message: data.message,
        timestamp: data.timestamp,
        type: "received",
      };
      setMessages((prev) => [...prev, message]);
      showToast("New Message", data.message.substring(0, 50), "info");
      playNotificationSound();
    });

    // Partner left chat
    socketService.on("partner_left_chat", (data) => {
      console.log("👋 Partner left chat:", data);
      showToast("Chat Ended", `${data.username} left the chat`, "warning");
      handleLeaveChat();
    });

    // Call accepted
    socketService.on("call_accepted", async (data) => {
      console.log("📞 ========================================");
      console.log("📞 CALL ACCEPTED EVENT");
      console.log("📞 ========================================");
      console.log("📞 Data received:", JSON.stringify(data, null, 2));
      console.log("📞 Setting currentRoom:", data.room_id);
      console.log("📞 Setting partnerSid:", data.partner_sid);
      console.log("📞 Setting callType:", data.call_type);

      //  Check if already in call to prevent duplicate
      if (isInCall) {
        console.log("⚠️ Already in call, ignoring duplicate call_accepted");
        return;
      }

      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setCallType(data.call_type);

      console.log("📞 Calling initializeCall as INITIATOR");
      await initializeCall(
        data.call_type,
        true,
        data.partner_sid,
        data.room_id
      );
      console.log("📞 ========================================");
    });

    // Call started
    socketService.on("call_started", async (data) => {
      console.log("📞 ========================================");
      console.log("📞 CALL STARTED EVENT");
      console.log("📞 ========================================");
      console.log("📞 Data received:", JSON.stringify(data, null, 2));
      console.log("📞 Setting currentRoom:", data.room_id);
      console.log("📞 Setting partnerSid:", data.partner_sid);
      console.log("📞 Setting callType:", data.call_type);

      //  Check if already in call
      if (isInCall) {
        console.log("⚠️ Already in call, ignoring duplicate call_started");
        return;
      }

      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setCallType(data.call_type);

      console.log("📞 Calling initializeCall as RECEIVER");
      await initializeCall(
        data.call_type,
        false,
        data.partner_sid,
        data.room_id
      );
      console.log("📞 ========================================");
    });

    // Call rejected
    socketService.on("call_rejected", (data) => {
      console.log("❌ Call rejected:", data);
      showToast(
        "Call Rejected",
        `${data.by_username} rejected the call`,
        "warning"
      );
      setPendingRequest(null);
    });

    // Call ended
    socketService.on("call_ended", (data) => {
      console.log("📞 Call ended:", data);
      showToast("Call Ended", `${data.ended_by} ended the call`, "info");
      handleEndCall();
    });

    // WebRTC signaling - Offer
    socketService.on("webrtc_offer", async (data) => {
      console.log("📥 ========================================");
      console.log("📥 WEBRTC OFFER RECEIVED");
      console.log("📥 ========================================");
      console.log("📥 Timestamp:", new Date().toISOString());
      console.log("📥 From SID:", data.from_sid);
      console.log("📥 Offer type:", data.offer?.type);
      console.log(
        "📥 Offer SDP (first 100 chars):",
        data.offer?.sdp?.substring(0, 100)
      );

      try {
        console.log("📥 Step 1: Checking peer connection state...");
        webrtcService.debugPeerConnection("Before handling offer");

        console.log("📥 Step 2: Checking local stream...");
        const hasLocalStream = !!webrtcService.getLocalStream();
        console.log("📥 Has local stream:", hasLocalStream);

        if (!hasLocalStream) {
          console.log("📥 ⚠️ No local stream yet, waiting 1 second...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("📥 Wait complete, checking again...");
          const hasLocalStreamNow = !!webrtcService.getLocalStream();
          console.log("📥 Has local stream now:", hasLocalStreamNow);
        }

        console.log("📥 Step 3: Handling offer...");
        const answer = await webrtcService.handleOffer(data.offer);
        console.log("📥 Step 3:  Answer created");
        console.log("📥 Answer type:", answer.type);
        console.log(
          "📥 Answer SDP (first 100 chars):",
          answer.sdp?.substring(0, 100)
        );

        console.log("📥 Step 4: Sending answer to:", data.from_sid);
        socketService.emit("webrtc_answer", {
          target_sid: data.from_sid,
          answer,
        });
        console.log("📥 Step 4:  Answer sent");

        webrtcService.debugPeerConnection("After handling offer");
        console.log("📥 ========================================");
        console.log("📥 WEBRTC OFFER HANDLED SUCCESSFULLY");
        console.log("📥 ========================================");
      } catch (error) {
        console.error("📥 ========================================");
        console.error("📥 ❌ ERROR HANDLING OFFER");
        console.error("📥 ========================================");
        console.error("📥 Error:", error);
        console.error(
          "📥 Error stack:",
          error instanceof Error ? error.stack : "No stack"
        );
        webrtcService.debugPeerConnection("Error handling offer");
        console.error("📥 ========================================");
      }
    });

    // WebRTC signaling - Answer
    socketService.on("webrtc_answer", async (data) => {
      console.log("📥 ========================================");
      console.log("📥 WEBRTC ANSWER RECEIVED");
      console.log("📥 ========================================");
      console.log("📥 Timestamp:", new Date().toISOString());
      console.log("📥 From SID:", data.from_sid);
      console.log("📥 Answer type:", data.answer?.type);
      console.log(
        "📥 Answer SDP (first 100 chars):",
        data.answer?.sdp?.substring(0, 100)
      );

      try {
        const pc = webrtcService.getState().peerConnection;

        if (pc && pc.remoteDescription) {
          console.log(
            "⚠️ Already have remote description, ignoring duplicate answer"
          );
          return;
        }
        console.log("📥 Step 1: Processing answer...");
        webrtcService.debugPeerConnection("Before handling answer");
        await webrtcService.handleAnswer(data.answer);
        console.log("📥 Step 1:  Answer processed");

        webrtcService.debugPeerConnection("After handling answer");
        console.log("📥 ========================================");
        console.log("📥 WEBRTC ANSWER HANDLED SUCCESSFULLY");
        console.log("📥 ========================================");
      } catch (error) {
        console.error("📥 ========================================");
        console.error("📥 ❌ ERROR HANDLING ANSWER");
        console.error("📥 ========================================");
        console.error("📥 Error:", error);
        console.error(
          "📥 Error stack:",
          error instanceof Error ? error.stack : "No stack"
        );
        webrtcService.debugPeerConnection("Error handling answer");
        console.error("📥 ========================================");
      }
    });

    // WebRTC signaling - ICE Candidate
    socketService.on("webrtc_ice_candidate", async (data) => {
      console.log("🧊 ========================================");
      console.log("🧊 ICE CANDIDATE RECEIVED");
      console.log("🧊 ========================================");
      console.log("🧊 Timestamp:", new Date().toISOString());
      console.log("🧊 From SID:", data.from_sid);
      console.log(
        "🧊 Candidate:",
        data.candidate?.candidate?.substring(0, 50) + "..."
      );

      try {
        console.log("🧊 Step 1: Adding ICE candidate...");
        webrtcService.debugPeerConnection("Before adding ICE candidate");
        await webrtcService.addIceCandidate(data.candidate);
        console.log("🧊 Step 1:  ICE candidate processed");

        webrtcService.debugPeerConnection("After adding ICE candidate");
        console.log("🧊 ========================================");
        console.log("🧊 ICE CANDIDATE HANDLED SUCCESSFULLY");
        console.log("🧊 ========================================");
      } catch (error) {
        console.error("🧊 ========================================");
        console.error("🧊 ❌ ERROR HANDLING ICE CANDIDATE");
        console.error("🧊 ========================================");
        console.error("🧊 Error:", error);
        console.error(
          "🧊 Error stack:",
          error instanceof Error ? error.stack : "No stack"
        );
        console.error("🧊 ========================================");
      }
    });

    socketService.on("webrtc_call_ended", () => {
      console.log("📞 WebRTC call ended event received");
      handleEndCall();
    });

    return () => {
      console.log("🧹 Cleaning up socket connection");
      //   socketService.disconnect();
    };
  }, [showToast, initializeCall, handleLeaveChat, handleEndCall]);

  // Chat functions
  const setUsername = useCallback((username: string) => {
    console.log("👤 Setting username:", username);
    socketService.emit("set_username", { username });
    setMyInfo((prev) => ({ ...prev, username }));
  }, []);

  const sendChatRequest = useCallback(
    (targetSid: string) => {
      console.log("💌 Sending chat request to:", targetSid);
      socketService.emit("send_chat_request", { target_sid: targetSid });
      showToast("Request Sent", "Waiting for response...", "info");
    },
    [showToast]
  );

  const acceptChatRequest = useCallback(() => {
    if (pendingRequest) {
      console.log(" Accepting request:", pendingRequest.request_id);
      if (pendingRequest.type === "chat") {
        socketService.emit("accept_chat_request", {
          request_id: pendingRequest.request_id,
        });
      } else {
        socketService.emit("accept_call", {
          request_id: pendingRequest.request_id,
        });
      }
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const rejectChatRequest = useCallback(() => {
    if (pendingRequest) {
      console.log("❌ Rejecting request:", pendingRequest.request_id);
      if (pendingRequest.type === "chat") {
        socketService.emit("reject_chat_request", {
          request_id: pendingRequest.request_id,
        });
      } else {
        socketService.emit("reject_call", {
          request_id: pendingRequest.request_id,
        });
      }
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const sendMessage = useCallback(
    (messageText: string) => {
      if (!currentRoom || !messageText.trim()) return;

      console.log("💬 Sending message to room:", currentRoom);
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      socketService.emit("send_private_message", {
        room_id: currentRoom,
        message: messageText,
        timestamp,
      });

      const message: Message = {
        id: `msg-${Date.now()}`,
        from_sid: myInfo.sid,
        from_username: myInfo.username,
        message: messageText,
        timestamp,
        type: "sent",
      };
      setMessages((prev) => [...prev, message]);
    },
    [currentRoom, myInfo]
  );

  const leaveChat = useCallback(() => {
    if (currentRoom) {
      console.log("👋 Emitting leave_chat for room:", currentRoom);
      socketService.emit("leave_chat", { room_id: currentRoom });
    }
    handleLeaveChat();
  }, [currentRoom, handleLeaveChat]);

  // Call functions
  const startCall = useCallback(
    (targetSid: string, type: CallType) => {
      console.log("📞 Starting call to:", targetSid, "Type:", type);
      socketService.emit("start_call", {
        target_sid: targetSid,
        call_type: type,
      });
      showToast("Calling...", "Waiting for response...", "info");
    },
    [showToast]
  );

  const acceptCall = useCallback(() => {
    if (pendingRequest) {
      console.log(" Accepting call request:", pendingRequest.request_id);
      socketService.emit("accept_call", {
        request_id: pendingRequest.request_id,
      });
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const rejectCall = useCallback(() => {
    if (pendingRequest) {
      console.log("❌ Rejecting call request:", pendingRequest.request_id);
      socketService.emit("reject_call", {
        request_id: pendingRequest.request_id,
      });
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const endCall = useCallback(() => {
    console.log("📞 Ending call, current room:", currentRoom);
    if (currentRoom) {
      socketService.emit("end_call", { room_id: currentRoom });
    }
    handleEndCall();
  }, [currentRoom, handleEndCall]);

  const toggleMute = useCallback(() => {
    console.log("🎤 Toggling mute, current:", isMuted);
    const newMutedState = !isMuted;
    webrtcService.toggleAudio(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    console.log("📹 Toggling video, current:", isVideoOff);
    const newVideoState = !isVideoOff;
    webrtcService.toggleVideo(!newVideoState);
    setIsVideoOff(newVideoState);
  }, [isVideoOff]);

  const value: ChatContextType = {
    myInfo,
    currentRoom,
    partnerSid,
    partnerInfo,
    pendingRequest,
    isInCall,
    isMuted,
    isVideoOff,
    callType,
    onlineUsers,
    setUsername,
    sendChatRequest,
    acceptChatRequest,
    rejectChatRequest,
    sendMessage,
    leaveChat,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    messages,
    toasts,
    showToast,
    removeToast,
    localStream,
    remoteStream,
    connected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
