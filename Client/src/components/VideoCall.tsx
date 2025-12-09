/**
 * VideoCall Component
 * Handles video and audio call interface with mobile optimization
 */

import React, { useRef, useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  User,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import { useCallContext } from "../contexts/CallContext";

export const VideoCall: React.FC = () => {
  const { partnerInfo } = useChatContext();
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
  } = useCallContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isPiPMinimized, setIsPiPMinimized] = useState(false);

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

  // Call duration timer
  useEffect(() => {
    if (isInCall) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [isInCall]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isInCall) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isInCall]);

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById("video-container");
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerMuted;
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isInCall) {
    return null;
  }

  return (
    <div
      id="video-container"
      className="fixed inset-0 z-50 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col animate-fade-in"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      <div className="flex-1 relative overflow-hidden">
        {/* Video Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain md:object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              {/* Avatar with gradient ring */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-linear-to-r from-primary-500 to-accent-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-2xl border-4 border-white/10">
                  <span className="text-5xl md:text-6xl font-bold">
                    {partnerInfo?.username.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping"></div>
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                {partnerInfo?.username || "Connecting..."}
              </h3>
              <p className="text-white/50 text-sm md:text-base mb-4">
                {remoteStream ? "Connected" : "Waiting for connection..."}
              </p>

              {/* Connection status */}
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                </span>
                <span>Calling...</span>
              </div>
            </div>
          </div>
        )}

        {callType === "video" && !isPiPMinimized && (
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-32 h-24 md:w-64 md:h-48 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-3 border-white/20 backdrop-blur-sm transition-all hover:scale-105 group">
            {localStream && !isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-6 h-6 md:w-10 md:h-10 text-white/30 mx-auto mb-1" />
                  <p className="text-xs text-white/40 hidden md:block">
                    Camera Off
                  </p>
                </div>
              </div>
            )}

            {/* PiP label */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              <p className="text-xs text-white/80">You</p>
            </div>

            {/* Minimize PiP button */}
            <button
              onClick={() => setIsPiPMinimized(true)}
              className="absolute top-2 right-2 p-1 rounded bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Minimize2 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        )}

        {/* PiP Minimized State */}
        {isPiPMinimized && (
          <button
            onClick={() => setIsPiPMinimized(false)}
            className="absolute bottom-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            <User className="w-5 h-5" />
          </button>
        )}

        <div
          className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-linear-to-b from-black/50 to-transparent backdrop-blur-sm transition-all duration-300 ${
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Partner Info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-accent-500  items-center justify-center font-bold shadow-lg">
                {partnerInfo?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm md:text-base">
                  {partnerInfo?.username}
                </p>
                <div className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {formatDuration(callDuration)}
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">
                    {callType === "video" ? "Video Call" : "Audio Call"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-2">
              {/* Settings (desktop only) */}
              <button
                className="hidden md:flex p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`relative bg-linear-to-t from-black/80 via-black/50 to-transparent backdrop-blur-xl border-t border-white/10 transition-all duration-300 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 md:gap-4">
            {/* Microphone Toggle */}
            <button
              onClick={toggleMute}
              className={`relative group flex flex-col items-center gap-1 md:gap-2 transition-all ${
                isMuted ? "text-red-400" : "text-white hover:text-primary-300"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-red-500 shadow-lg shadow-red-500/50"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Mic className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span className="text-xs hidden md:block">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            {/* Video Toggle (only for video calls) */}
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`relative group flex flex-col items-center gap-1 md:gap-2 transition-all ${
                  isVideoOff
                    ? "text-red-400"
                    : "text-white hover:text-primary-300"
                }`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                    isVideoOff
                      ? "bg-red-500 shadow-lg shadow-red-500/50"
                      : "bg-white/10 hover:bg-white/20 border border-white/20"
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Video className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <span className="text-xs hidden md:block">
                  {isVideoOff ? "Camera" : "Camera"}
                </span>
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="relative group flex flex-col items-center gap-1 md:gap-2"
              title="End call"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/50 transition-all hover:scale-110 active:scale-95">
                <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-xs hidden md:block text-red-400">
                End Call
              </span>
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={toggleSpeaker}
              className={`relative group flex flex-col items-center gap-1 md:gap-2 transition-all ${
                isSpeakerMuted
                  ? "text-red-400"
                  : "text-white hover:text-primary-300"
              }`}
              title={isSpeakerMuted ? "Unmute speaker" : "Mute speaker"}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                  isSpeakerMuted
                    ? "bg-red-500 shadow-lg shadow-red-500/50"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
              >
                {isSpeakerMuted ? (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span className="text-xs hidden md:block">
                {isSpeakerMuted ? "Speaker" : "Speaker"}
              </span>
            </button>
          </div>

          {/* Mobile hint */}
          <div className="mt-4 text-center md:hidden">
            <p className="text-xs text-white/40">
              Tap screen to show/hide controls
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Prevent text selection during call */
        #video-container {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
        }

        /* Smooth transitions for fullscreen */
        #video-container:-webkit-full-screen {
          width: 100%;
          height: 100%;
        }

        #video-container:-moz-full-screen {
          width: 100%;
          height: 100%;
        }

        #video-container:fullscreen {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
