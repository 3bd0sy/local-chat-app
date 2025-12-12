import type { CallType } from "../types";

type StreamCallback = (stream: MediaStream | null) => void;
type IceCandidateCallback = (candidate: RTCIceCandidate) => void;

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onTrackCallbacks: StreamCallback[] = [];
  private onIceCandidateCallbacks: IceCandidateCallback[] = [];
  private debugMode = false;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet = false;

  private connectionTimeout: NodeJS.Timeout | null = null;

  // Stream Observables
  private streamObservers: Map<string, Set<StreamCallback>> = new Map();

  async initializeLocalStream(type: CallType): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video:
          type === "video"
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }

      this.localStream = stream;
      this.notifyObservers("localStream", stream);

      return stream;
    } catch (error) {
      console.error("Error getting local stream:", error);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }
      throw error;
    }
  }

  createPeerConnection(): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    };

    const pc = new RTCPeerConnection(configuration);
    this.peerConnection = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidateCallbacks.forEach((callback) =>
          callback(event.candidate!)
        );
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.notifyObservers("remoteStream", this.remoteStream);
        this.onTrackCallbacks.forEach((callback) =>
          callback(this.remoteStream)
        );
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
      }
    };

    return pc;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      this.isRemoteDescriptionSet = true;
      await this.processPendingIceCandidates();

      const answer = await this.peerConnection.createAnswer();

      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error(" Error handling offer:", error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      this.isRemoteDescriptionSet = true;
      await this.processPendingIceCandidates();
    } catch (error) {
      console.error(" Error handling answer:", error);
      throw error;
    }
  }

  private async processPendingIceCandidates(): Promise<void> {
    if (!this.peerConnection || this.pendingIceCandidates.length === 0) {
      return;
    }

    const candidatesToProcess = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];

    let successCount = 0;
    let failCount = 0;

    for (const candidate of candidatesToProcess) {
      try {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
        successCount++;
      } catch (error) {
        console.warn(" Failed to process pending ICE candidate:", error);
        failCount++;
        this.pendingIceCandidates.push(candidate);
      }
    }
  }

  async initializePeerConnection(): Promise<RTCPeerConnection> {
    const pc = this.createPeerConnection();

    return pc;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (
      !this.peerConnection ||
      this.peerConnection.connectionState === "closed"
    ) {
      const candidateExists = this.pendingIceCandidates.some(
        (existing) => existing.candidate === candidate.candidate
      );
      if (!candidateExists) {
        this.pendingIceCandidates.push(candidate);
      }
      return;
    }

    if (!this.isRemoteDescriptionSet) {
      const candidateExists = this.pendingIceCandidates.some(
        (existing) => existing.candidate === candidate.candidate
      );
      if (!candidateExists) {
        this.pendingIceCandidates.push(candidate);
      }
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn("Failed to add ICE candidate:", error);
      const candidateExists = this.pendingIceCandidates.some(
        (existing) => existing.candidate === candidate.candidate
      );
      if (!candidateExists) {
        this.pendingIceCandidates.push(candidate);
      }
    }
  }

  toggleAudio(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  // Observer pattern for streams
  observeStream(
    type: "localStream" | "remoteStream",
    callback: StreamCallback
  ): () => void {
    if (!this.streamObservers.has(type)) {
      this.streamObservers.set(type, new Set());
    }

    this.streamObservers.get(type)!.add(callback);

    if (type === "localStream") callback(this.localStream);
    if (type === "remoteStream") callback(this.remoteStream);

    return () => {
      this.streamObservers.get(type)?.delete(callback);
    };
  }

  private notifyObservers(
    type: "localStream" | "remoteStream",
    stream: MediaStream | null
  ) {
    this.streamObservers.get(type)?.forEach((callback) => {
      callback(stream);
    });
  }

  // Callbacks
  setOnTrackCallback(callback: StreamCallback) {
    this.onTrackCallbacks.push(callback);
  }

  setOnIceCandidateCallback(callback: IceCandidateCallback) {
    this.onIceCandidateCallbacks.push(callback);
  }

  getConnectionStatus(): {
    iceConnectionState: string;
    connectionState: string;
    signalingState: string;
    hasLocalStream: boolean;
    hasRemoteStream: boolean;
    pendingCandidates: number;
  } {
    return {
      iceConnectionState:
        this.peerConnection?.iceConnectionState || "disconnected",
      connectionState: this.peerConnection?.connectionState || "disconnected",
      signalingState: this.peerConnection?.signalingState || "closed",
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      pendingCandidates: this.pendingIceCandidates.length,
    };
  }

  // Cleanup
  cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    this.onTrackCallbacks = [];
    this.onIceCandidateCallbacks = [];
    this.pendingIceCandidates = [];
    this.isRemoteDescriptionSet = false;

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
      this.notifyObservers("localStream", null);
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
      this.notifyObservers("remoteStream", null);
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  getConnectionState() {
    return {
      peerConnection: this.peerConnection,
      isRemoteDescriptionSet: this.isRemoteDescriptionSet,
      pendingIceCandidates: this.pendingIceCandidates.length,
      remoteDescription: this.peerConnection?.remoteDescription,
      localDescription: this.peerConnection?.localDescription,
    };
  }

  // Debug
  debugPeerConnection(label: string) {
    if (!this.debugMode) return;

    const pc = this.peerConnection;
    if (!pc) {
      console.log(`${label}: No peer connection`);
      return;
    }
  }

  // Getters
  getState() {
    return {
      peerConnection: this.peerConnection,
      localStream: this.localStream,
      remoteStream: this.remoteStream,
    };
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

export const webrtcService = new WebRTCService();
