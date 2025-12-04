/**
 * WebRTC service for video/audio calls
 */

import type { WebRTCState, CallType } from "../types";

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

class WebRTCService {
  private state: WebRTCState = {
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    pendingCandidates: [],
  };

  private onTrackCallback: ((stream: MediaStream) => void) | null = null;
  private onIceCandidateCallback:
    | ((candidate: RTCIceCandidate) => void)
    | null = null;

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(callType: CallType): Promise<MediaStream> {
    try {
      console.log("🎥 ===== INITIALIZE LOCAL STREAM =====");
      console.log("🎥 Call type:", callType);

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support camera/microphone access. " +
            "Please use HTTPS or access via localhost, and use a modern browser like Chrome or Firefox."
        );
      }

      // Enumerate devices first for debugging
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(
          "🎥 Available devices:",
          devices.map((d) => ({
            kind: d.kind,
            label: d.label,
            deviceId: d.deviceId,
          }))
        );
      } catch (e) {
        console.warn("🎥 Could not enumerate devices:", e);
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          callType === "video"
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
              }
            : false,
      };

      console.log("🎥 Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log("🎥  Stream obtained successfully");
      console.log(
        "🎥 Stream tracks:",
        stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
          settings: track.getSettings(),
        }))
      );

      this.state.localStream = stream;

      console.log("🎥 ===== INITIALIZE LOCAL STREAM COMPLETE =====");
      return stream;
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);

      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Camera/microphone access denied. Please allow access in browser settings."
          );
        } else if (error.name === "NotFoundError") {
          throw new Error(
            "No camera/microphone found. Please connect a device."
          );
        } else if (error.name === "NotReadableError") {
          throw new Error(
            "Camera/microphone is already in use by another application."
          );
        }
      }

      throw new Error(
        "Failed to access camera/microphone. Make sure you are using HTTPS or localhost."
      );
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection(): RTCPeerConnection {
    if (this.state.peerConnection) {
      console.log("⚠️ Closing existing peer connection");
      this.state.peerConnection.close();
    }

    console.log("🔗 ===== CREATE PEER CONNECTION =====");
    console.log(
      "🔗 Creating new peer connection with config:",
      RTC_CONFIGURATION
    );

    const pc = new RTCPeerConnection(RTC_CONFIGURATION);
    this.state.peerConnection = pc;
    pc.ontrack = (event) => {
      console.log("📥 ===== ONTRACK EVENT FIRED =====");
      console.log("📥 Track kind:", event.track.kind);
      console.log("📥 Stream count:", event.streams.length);

      if (!this.state.remoteStream) {
        console.log("🎬 Creating new remote stream");
        this.state.remoteStream = new MediaStream();
      }

      this.state.remoteStream.addTrack(event.track);
      console.log(
        " Track added. Total tracks:",
        this.state.remoteStream.getTracks().length
      );

      if (this.onTrackCallback) {
        console.log("📡 Calling onTrack callback");
        this.onTrackCallback(this.state.remoteStream);
      }
    };

    // Debug peer connection state changes
    this.debugPeerConnection("After creation");

    // Add local stream tracks
    if (this.state.localStream) {
      console.log("📤 Adding local tracks to peer connection");
      const tracks = this.state.localStream.getTracks();
      console.log(`📤 Found ${tracks.length} local tracks`);

      tracks.forEach((track) => {
        console.log(`  - Adding ${track.kind} track:`, track.label);
      });
    } else {
      console.warn("⚠️ No local stream available to add tracks");
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 New ICE candidate generated:", {
          type: event.candidate.type,
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
        if (this.onIceCandidateCallback) {
          this.onIceCandidateCallback(event.candidate);
        }
      } else {
        console.log("🧊 ICE gathering complete");
        console.log("🧊 Final ICE gathering state:", pc.iceGatheringState);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("🔌 Connection state changed:", pc.connectionState);
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        console.warn("⚠️ Connection problem detected:", pc.connectionState);
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state changed:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        console.error("❌ ICE connection failed!");
      }
    };

    // Handle signaling state
    pc.onsignalingstatechange = () => {
      console.log("📡 Signaling state changed:", pc.signalingState);
    };

    // Handle negotiation needed
    pc.onnegotiationneeded = () => {
      console.log("🤝 Negotiation needed event fired");
    };

    console.log("🔗 ===== PEER CONNECTION CREATED =====");
    return pc;
  }

  /**
   * Create and send offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const pc = this.state.peerConnection;
    if (!pc) {
      throw new Error("Peer connection not initialized");
    }

    console.log("📝 ===== CREATE OFFER =====");
    this.debugPeerConnection("Before creating offer");

    // Create offer with options to receive audio and video
    const offerOptions: RTCOfferOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: false,
    };

    console.log("📝 Creating offer with options:", offerOptions);
    const offer = await pc.createOffer(offerOptions);

    console.log(" Offer created:", {
      type: offer.type,
      sdpLength: offer.sdp?.length,
      sdpPreview: offer.sdp?.substring(0, 200) + "...",
    });

    // Log SDP details
    if (offer.sdp) {
      const lines = offer.sdp.split("\n");
      console.log("📝 SDP Media sections:");
      lines
        .filter((line) => line.startsWith("m="))
        .forEach((line) => {
          console.log("  ", line);
        });
    }

    await pc.setLocalDescription(offer);
    console.log(" Local description set");

    this.debugPeerConnection("After setting local description");
    console.log("📝 ===== CREATE OFFER COMPLETE =====");

    return offer;
  }

  /**
   * Handle remote offer
   */
  async handleOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = this.state.peerConnection;
    if (!pc) {
      throw new Error("Peer connection not initialized");
    }

    console.log("📥 ===== HANDLE OFFER =====");
    this.debugPeerConnection("Before handling offer");

    console.log("📥 Received remote offer:", {
      type: offer.type,
      sdpLength: offer.sdp?.length,
      sdpPreview: offer.sdp?.substring(0, 200) + "...",
    });

    // Log SDP details
    if (offer.sdp) {
      const lines = offer.sdp.split("\n");
      console.log("📥 Remote SDP Media sections:");
      lines
        .filter((line) => line.startsWith("m="))
        .forEach((line) => {
          console.log("  ", line);
        });
    }

    console.log("📥 Setting remote description...");
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    console.log(" Remote description set");

    console.log("📝 Creating answer...");
    const answer = await pc.createAnswer();
    console.log(" Answer created:", {
      type: answer.type,
      sdpLength: answer.sdp?.length,
    });

    await pc.setLocalDescription(answer);
    console.log(" Local description set");

    // Add any pending ICE candidates
    if (this.state.pendingCandidates.length > 0) {
      console.log(
        `🧊 Adding ${this.state.pendingCandidates.length} pending ICE candidates`
      );
      for (const candidate of this.state.pendingCandidates) {
        try {
          await pc.addIceCandidate(candidate);
          console.log(" Added pending candidate");
        } catch (error) {
          console.error("❌ Error adding pending candidate:", error);
        }
      }
      this.state.pendingCandidates = [];
      console.log(" Pending candidates added");
    }

    this.debugPeerConnection("After handling offer");
    console.log("📥 ===== HANDLE OFFER COMPLETE =====");

    return answer;
  }

  /**
   * Handle remote answer
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.state.peerConnection;
    if (!pc) {
      throw new Error("Peer connection not initialized");
    }

    console.log("📥 ===== HANDLE ANSWER =====");
    this.debugPeerConnection("Before handling answer");

    console.log("📥 Received remote answer:", {
      type: answer.type,
      sdpLength: answer.sdp?.length,
    });

    // Log SDP details
    if (answer.sdp) {
      const lines = answer.sdp.split("\n");
      console.log("📥 Remote SDP Media sections:");
      lines
        .filter((line) => line.startsWith("m="))
        .forEach((line) => {
          console.log("  ", line);
        });
    }

    console.log("📥 Setting remote description from answer...");
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    console.log(" Remote description set from answer");

    this.debugPeerConnection("After handling answer");
    console.log("📥 ===== HANDLE ANSWER COMPLETE =====");
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.state.peerConnection;

    if (!pc || !pc.remoteDescription) {
      // Store for later if remote description not set yet
      console.log(
        "⏳ Storing ICE candidate for later (no remote description yet)"
      );
      this.state.pendingCandidates.push(new RTCIceCandidate(candidate));
      return;
    }

    try {
      console.log("🧊 Adding ICE candidate:", {
        candidate: candidate.candidate?.substring(0, 100) + "...",
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      });

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(" ICE candidate added successfully");
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
      console.error("❌ Candidate:", candidate);
    }
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(muted: boolean): void {
    if (this.state.localStream) {
      const audioTracks = this.state.localStream.getAudioTracks();
      console.log(
        `🎤 Toggling audio mute: ${muted}, Found ${audioTracks.length} audio tracks`
      );
      audioTracks.forEach((track) => {
        console.log(
          `🎤 Audio track ${track.id}: ${track.enabled} -> ${!muted}`
        );
        track.enabled = !muted;
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.state.localStream) {
      const videoTracks = this.state.localStream.getVideoTracks();
      console.log(
        `📹 Toggling video: ${enabled}, Found ${videoTracks.length} video tracks`
      );
      videoTracks.forEach((track) => {
        console.log(
          `📹 Video track ${track.id}: ${track.enabled} -> ${enabled}`
        );
        track.enabled = enabled;
      });
    }
  }

  /**
   * Clean up and close connections
   */
  cleanup(): void {
    console.log("🧹 ===== CLEANING UP WEBRTC =====");

    // Stop local stream
    if (this.state.localStream) {
      console.log(
        "🧹 Stopping local stream tracks:",
        this.state.localStream.getTracks().length
      );
      this.state.localStream.getTracks().forEach((track) => {
        console.log(`🧹 Stopping ${track.kind} track: ${track.id}`);
        track.stop();
      });
      this.state.localStream = null;
    }

    // Stop remote stream
    if (this.state.remoteStream) {
      console.log(
        "🧹 Stopping remote stream tracks:",
        this.state.remoteStream.getTracks().length
      );
      this.state.remoteStream.getTracks().forEach((track) => {
        console.log(`🧹 Stopping ${track.kind} track: ${track.id}`);
        track.stop();
      });
      this.state.remoteStream = null;
    }

    // Close peer connection
    if (this.state.peerConnection) {
      console.log("🧹 Closing peer connection");
      this.state.peerConnection.close();
      this.state.peerConnection = null;
    }

    // Clear pending candidates
    console.log(
      `🧹 Clearing ${this.state.pendingCandidates.length} pending candidates`
    );
    this.state.pendingCandidates = [];

    console.log("🧹 ===== CLEANUP COMPLETE =====");
  }

  /**
   * Set callback for track events
   */
  setOnTrackCallback(callback: (stream: MediaStream) => void): void {
    console.log("📡 Setting onTrack callback");
    this.onTrackCallback = callback;
  }

  /**
   * Set callback for ICE candidate events
   */
  setOnIceCandidateCallback(
    callback: (candidate: RTCIceCandidate) => void
  ): void {
    console.log("🧊 Setting onIceCandidate callback");
    this.onIceCandidateCallback = callback;
  }

  /**
   * Get current state
   */
  getState(): WebRTCState {
    return { ...this.state };
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.state.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.state.remoteStream;
  }

  /**
   * Debug function to check peer connection state
   */
  debugPeerConnection(context: string = ""): void {
    const pc = this.state.peerConnection;
    if (!pc) {
      console.log(`🔍 [${context}] No peer connection`);
      return;
    }

    console.log(`🔍 ===== PEER CONNECTION DEBUG [${context}] =====`);
    console.log("🔍 Signaling state:", pc.signalingState);
    console.log("🔍 ICE connection state:", pc.iceConnectionState);
    console.log("🔍 Connection state:", pc.connectionState);
    console.log("🔍 ICE gathering state:", pc.iceGatheringState);
    console.log("🔍 Local description:", pc.localDescription?.type);
    console.log("🔍 Remote description:", pc.remoteDescription?.type);

    // Check transceivers
    const transceivers = pc.getTransceivers();
    console.log("🔍 Transceivers count:", transceivers.length);

    transceivers.forEach((transceiver, index) => {
      console.log(`  Transceiver ${index}:`, {
        mid: transceiver.mid,
        direction: transceiver.direction,
        currentDirection: transceiver.currentDirection,
        receiverTrack: transceiver.receiver?.track?.kind,
        receiverTrackState: transceiver.receiver?.track?.readyState,
        senderTrack: transceiver.sender?.track?.kind,
        senderTrackState: transceiver.sender?.track?.readyState,
      });
    });

    // Check senders
    const senders = pc.getSenders();
    console.log("🔍 Senders count:", senders.length);
    senders.forEach((sender, index) => {
      console.log(`  Sender ${index}:`, {
        track: sender.track?.kind,
        trackId: sender.track?.id,
        trackState: sender.track?.readyState,
      });
    });

    // Check receivers
    const receivers = pc.getReceivers();
    console.log("🔍 Receivers count:", receivers.length);
    receivers.forEach((receiver, index) => {
      console.log(`  Receiver ${index}:`, {
        track: receiver.track?.kind,
        trackId: receiver.track?.id,
        trackState: receiver.track?.readyState,
      });
    });

    console.log("🔍 ===== END DEBUG [${context}] =====");
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
