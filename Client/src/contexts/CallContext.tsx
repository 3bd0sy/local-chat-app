import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useToastContext } from "../providers/ToastProvider";
import { socketService } from "../services/socketService";
import { webrtcService } from "../services/webrtcService";
import { useSocketEvents } from "../hooks/useSocketEvents";
import type { CallType, CallRequest } from "../types";
import { sounds } from "../utils/soundManager";

interface CallContextType {
  isInCall: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  callType: CallType | null;
  pendingCallRequest: CallRequest | null;
  currentRoom: string | null;
  partnerSid: string | null;

  // Functions
  startCall: (targetSid: string, callType: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  switchCamera: () => Promise<void>;

  // Streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { showToast } = useToastContext();

  // State
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [pendingCallRequest, setPendingCallRequest] =
    useState<CallRequest | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [partnerSid, setPartnerSid] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Refs
  const pendingCallRequestRef = useRef<CallRequest | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const partnerSidRef = useRef<string | null>(null);
  const webrtcInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const callTypeRef = useRef<CallType | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const handleStreamChange = useCallback(
    async (newStream: MediaStream) => {
      try {
        // Stop all tracks of the old stream
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        // Update local stream state
        setLocalStream(newStream);

        // Update peer connection with new video track
        const videoTrack = newStream.getVideoTracks()[0];
        const pc = webrtcService.getPeerConnection();

        if (pc && videoTrack) {
          // Find the video sender
          const senders = pc.getSenders();
          const videoSender = senders.find(
            (sender) => sender.track?.kind === "video"
          );

          if (videoSender) {
            await videoSender.replaceTrack(videoTrack);
          } else {
            // If no video sender exists, add the track
            pc.addTrack(videoTrack, newStream);
          }
        } else {
          console.log("⚠️ No peer connection or video track", {
            hasPeerConnection: !!pc,
            hasVideoTrack: !!videoTrack,
          });
        }
        // Update local stream in webrtcService observers
        webrtcService.updateLocalStream(newStream);
      } catch (error) {
        showToast("Error", "Failed to switch camera", "error");
      }
    },
    [showToast]
  );

  const switchCamera = useCallback(async () => {
    try {
      if (!localStreamRef.current) {
        showToast("Error", "No active video stream", "error");
        return;
      }

      // Get current video track
      const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (!currentVideoTrack) {
        showToast("Error", "No video track found", "error");
        return;
      }

      // Get all video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length < 2) {
        showToast("Info", "Only one camera available", "info");
        return;
      }

      // Get current device ID
      const currentDeviceId = currentVideoTrack.getSettings().deviceId;

      // Find next camera
      const currentIndex = videoDevices.findIndex(
        (device) => device.deviceId === currentDeviceId
      );

      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];

      // Stop current video track
      currentVideoTrack.stop();

      // Get new stream with selected camera
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: nextDevice.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Handle the stream change
      await handleStreamChange(newStream);

      showToast("Success", "Camera switched", "success");
    } catch (error) {
      showToast("Error", "Failed to switch camera", "error");
    }
  }, [handleStreamChange, showToast]);

  // Update refs when state changes
  useEffect(() => {
    pendingCallRequestRef.current = pendingCallRequest;
    currentRoomRef.current = currentRoom;
    partnerSidRef.current = partnerSid;
    callTypeRef.current = callType;
    localStreamRef.current = localStream;
  }, [
    pendingCallRequest,
    currentRoom,
    partnerSid,
    callType,
    localStream,
    isInCall,
  ]);
  const isInCallRef = useRef(false);

  useEffect(() => {
    pendingCallRequestRef.current = pendingCallRequest;
    currentRoomRef.current = currentRoom;
    partnerSidRef.current = partnerSid;
    callTypeRef.current = callType;
    localStreamRef.current = localStream;
    isInCallRef.current = isInCall;
  }, [
    pendingCallRequest,
    currentRoom,
    partnerSid,
    callType,
    localStream,
    isInCall,
  ]);
  // Subscribe to stream updates
  useEffect(() => {
    const unsubscribeLocal = webrtcService.observeStream(
      "localStream",
      setLocalStream
    );
    const unsubscribeRemote = webrtcService.observeStream(
      "remoteStream",
      setRemoteStream
    );

    return () => {
      unsubscribeLocal();
      unsubscribeRemote();
    };
  }, []);

  const endCall = useCallback(() => {
    if (!isInCall && !webrtcInitializedRef.current && !currentRoomRef.current) {
      return;
    }

    try {
      webrtcService.cleanup();
    } catch (err) {
      console.warn(" WebRTC cleanup error:", err);
    }

    webrtcInitializedRef.current = false;
    isInitializingRef.current = false;

    const roomToEnd = currentRoomRef.current;

    if (roomToEnd) {
      currentRoomRef.current = null;
      socketService
        .emit("end_call", {
          room_id: roomToEnd,
        })
        .catch((err) => console.warn(" Failed to emit end_call:", err));
    }

    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallType(null);
    setCurrentRoom(null);
    setPartnerSid(null);
    setPendingCallRequest(null);
    setLocalStream(null);
    setRemoteStream(null);

    showToast("Call Ended", "You have ended the call", "info");
  }, [showToast]);

  const handleIncomingCall = useCallback(
    (data: CallRequest) => {
      if (pendingCallRequestRef.current) {
        socketService.emit("reject_call", {
          request_id: data.request_id,
        });
        return;
      }

      setPendingCallRequest(data);

      const callTypeText =
        data.call_type === "video" ? "video call" : "audio call";
      showToast(
        "Incoming Call",
        `${data.from_username} wants to ${callTypeText}`,
        "info"
      );
      // play sound when calling
      sounds.callRinging.currentTime = 0;
      sounds.callRinging.play();
    },
    [showToast]
  );

  const initializeWebRTC = useCallback(
    async (
      type: CallType,
      isInitiator: boolean,
      targetSid: string,
      roomId?: string
    ) => {
      if (isInitializingRef.current || webrtcInitializedRef.current) {
        console.log(" WebRTC initialization already in progress");
        return;
      }

      try {
        isInitializingRef.current = true;

        setIsInCall(true);
        setCallType(type);
        setPartnerSid(targetSid);

        if (roomId) setCurrentRoom(roomId);

        if (webrtcInitializedRef.current) {
          webrtcService.cleanup();
        }

        const stream = await webrtcService.initializeLocalStream(type);

        const pc = await webrtcService.initializePeerConnection();
        webrtcInitializedRef.current = true;

        webrtcService.setOnTrackCallback((remoteStream) => {
          setRemoteStream(remoteStream);
        });

        webrtcService.setOnIceCandidateCallback((candidate) => {
          if (targetSid) {
            const socketId = socketService.getSocketId();
            socketService.emit("webrtc_ice_candidate", {
              target_sid: targetSid,
              candidate: candidate.toJSON(),
              from_sid: socketId || "",
            });
          }
        });

        stream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, stream);
          } catch (error) {
            console.error(" Error adding track:", error);
          }
        });

        if (isInitiator) {
          const offer = await webrtcService.createOffer();
          const socketId = socketService.getSocketId();
          socketService.emit("webrtc_offer", {
            target_sid: targetSid,
            offer,
            from_sid: socketId || "",
          });
        }

        webrtcInitializedRef.current = true;
      } catch (error) {
        console.error(" Error in initializeWebRTC:", error);
        showToast("Error", "Failed to start call", "error");
        endCall();
      } finally {
        isInitializingRef.current = false;
      }
    },
    [showToast, endCall]
  );
  const handleCallAccepted = useCallback(
    async (data: {
      room_id: string;
      partner_sid: string;
      call_type: CallType;
    }) => {
      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setCallType(data.call_type);

      await initializeWebRTC(
        data.call_type,
        true,
        data.partner_sid,
        data.room_id
      );
    },
    [isInCall, initializeWebRTC]
  );

  const handleCallStarted = useCallback(
    async (data: {
      room_id: string;
      partner_sid: string;
      call_type: CallType;
    }) => {
      if (isInCall) {
        return;
      }

      setCurrentRoom(data.room_id);
      setPartnerSid(data.partner_sid);
      setCallType(data.call_type);
      setIsInCall(true);
    },
    [isInCall]
  );

  const handleWebrtcOffer = useCallback(
    async (data: { from_sid: string; offer: RTCSessionDescriptionInit }) => {
      try {
        if (!webrtcInitializedRef.current) {
          const callType =
            callTypeRef.current ||
            pendingCallRequestRef.current?.call_type ||
            "video";
          setIsInCall(true);
          setCallType(callType);
          setPartnerSid(data.from_sid);

          const stream = await webrtcService.initializeLocalStream(callType);
          const pc = webrtcService.createPeerConnection();
          webrtcInitializedRef.current = true;
          webrtcService.setOnTrackCallback((remoteStream) => {
            setRemoteStream(remoteStream);
          });

          webrtcService.setOnIceCandidateCallback((candidate) => {
            const socketId = socketService.getSocketId();
            socketService.emit("webrtc_ice_candidate", {
              target_sid: data.from_sid,
              candidate: candidate.toJSON(),
              from_sid: socketId || "",
            });
          });

          stream.getTracks().forEach((track) => {
            try {
              pc.addTrack(track, stream);
            } catch (error) {
              console.error(" Error adding track:", error);
            }
          });

          setIsInCall(true);
          setCallType(callType);
          setPartnerSid(data.from_sid);
        }

        const answer = await webrtcService.handleOffer(data.offer);
        const socketId = socketService.getSocketId();
        socketService.emit("webrtc_answer", {
          target_sid: data.from_sid,
          answer,
          from_sid: socketId || "",
        });
      } catch (error) {
        console.error(" Error handling offer:", error);
        showToast("Error", "Failed to process call request", "error");
      }
    },
    [showToast]
  );

  const handleWebrtcAnswer = useCallback(
    async (data: { from_sid: string; answer: RTCSessionDescriptionInit }) => {
      try {
        await webrtcService.handleAnswer(data.answer);
      } catch (error) {
        console.error(" Error handling answer:", error);
      }
    },
    []
  );

  const handleWebrtcIceCandidate = useCallback(
    async (data: { from_sid: string; candidate: RTCIceCandidateInit }) => {
      try {
        if (!webrtcInitializedRef.current) {
          return;
        }

        await webrtcService.addIceCandidate(data.candidate);
      } catch (error) {
        console.warn(" Failed to add ICE candidate:", error);
      }
    },
    []
  );

  const handleCallRejected = useCallback(
    (data: { by_username: string }) => {
      showToast(
        "Call Rejected",
        `${data.by_username} rejected the call`,
        "warning"
      );
      sounds.callRinging.pause();
      sounds.callRinging.currentTime = 0;
      setPendingCallRequest(null);
    },
    [showToast]
  );

  const handleCallEnded = useCallback(
    (data: { ended_by: string }) => {
      if (
        !isInCall &&
        !webrtcInitializedRef.current &&
        !currentRoomRef.current
      ) {
        return;
      }

      showToast("Call Ended", `${data.ended_by} ended the call`, "info");
      endCall();
    },
    [showToast, endCall]
  );

  // Register all socket events
  useSocketEvents({
    incoming_call: handleIncomingCall,
    call_accepted: handleCallAccepted,
    call_started: handleCallStarted,
    call_rejected: handleCallRejected,
    call_ended: handleCallEnded,
    webrtc_offer: handleWebrtcOffer,
    webrtc_answer: handleWebrtcAnswer,
    webrtc_ice_candidate: handleWebrtcIceCandidate,
  });

  // Call functions
  const startCall = useCallback(
    (targetSid: string, type: CallType) => {
      setCallType(type);
      socketService.emit("start_call", {
        target_sid: targetSid,
        call_type: type,
      });

      showToast("Calling...", "Waiting for response...", "info");
    },
    [showToast]
  );

  const acceptCall = useCallback(() => {
    const request = pendingCallRequestRef.current;
    if (!request) {
      showToast("Error", "No pending call request", "error");
      return;
    }

    socketService.emit("accept_call", {
      request_id: request.request_id,
    });

    if (sounds.callRinging) {
      sounds.callRinging.pause();
      sounds.callRinging.currentTime = 0;
    }

    setPendingCallRequest(null);
    showToast("Call Accepted", "Connecting...", "success");
  }, [showToast]);

  const rejectCall = useCallback(() => {
    const request = pendingCallRequestRef.current;
    if (!request) {
      showToast("Error", "No pending call request", "error");
      return;
    }

    socketService.emit("reject_call", {
      request_id: request.request_id,
    });

    if (sounds.callRinging) {
      sounds.callRinging.pause();
      sounds.callRinging.currentTime = 0;
    }

    setPendingCallRequest(null);
    showToast("Call Rejected", "You rejected the call", "warning");
  }, [showToast]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    webrtcService.toggleAudio(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    const newVideoState = !isVideoOff;
    webrtcService.toggleVideo(!newVideoState);
    setIsVideoOff(newVideoState);
  }, [isVideoOff]);

  const value: CallContextType = {
    isInCall,
    isMuted,
    isVideoOff,
    callType,
    pendingCallRequest,
    currentRoom,
    partnerSid,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    localStream,
    remoteStream,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
