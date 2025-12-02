/**
 * VideoCall Component
 * Handles video and audio call interface
 */

import React, { useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";

export const VideoCall: React.FC = () => {
  const {
    isInCall,
    isMuted,
    isVideoOff,
    callType,
    localStream,
    remoteStream,
    toggleMute,
    toggleVideo,
    endCall,
    partnerInfo,
  } = useChatContext();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleFullscreen = () => {
    const elem = document.getElementById("video-container");
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isInCall) {
    return null;
  }

  return (
    <div
      id="video-container"
      className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in"
    >
      {/* Remote video (main) */}
      <div className="flex-1 relative bg-linear-to-br from-slate-800 to-slate-900">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-linear-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-5xl font-bold">
                  {partnerInfo?.username.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <p className="text-xl font-display font-semibold">
                {partnerInfo?.username || "Connecting..."}
              </p>
              <p className="text-white/50 mt-2 animate-pulse-soft">
                Waiting for connection...
              </p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        {callType === "video" && (
          <div className="absolute bottom-6 right-6 w-64 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-white/30" />
              </div>
            )}
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-white/50" />
              </div>
            )}
          </div>
        )}

        {/* Call info */}
        <div className="absolute top-6 left-6 glass rounded-xl px-4 py-3">
          <p className="font-medium">{partnerInfo?.username}</p>
          <p className="text-sm text-white/50">
            {callType === "video" ? "Video Call" : "Audio Call"}
          </p>
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 glass rounded-lg p-3 hover:bg-white/20 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="glass border-t border-white/10 p-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`btn ${
              isMuted ? "btn-danger" : "bg-white/10 hover:bg-white/20"
            } w-14 h-14 rounded-full flex items-center justify-center`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* Video toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`btn ${
                isVideoOff ? "btn-danger" : "bg-white/10 hover:bg-white/20"
              } w-14 h-14 rounded-full flex items-center justify-center`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          )}

          {/* End call button */}
          <button
            onClick={endCall}
            className="btn btn-danger w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
            title="End call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom CSS for mirror effect
const style = document.createElement("style");
style.textContent = `
  .mirror {
    transform: scaleX(-1);
  }
`;
document.head.appendChild(style);
