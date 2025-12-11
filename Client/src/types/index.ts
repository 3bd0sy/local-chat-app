/**
 * Type definitions for the chat application
 */

// User information interface
export interface UserInfo {
  sid: string;
  ip: string;
  username: string;
  status: UserStatus;
  in_call?: boolean;
}

// Message interface
export interface Message {
  id: string;
  from_sid: string;
  from_username: string;
  message: string;
  timestamp: string;
  type: "sent" | "received";
  fileData?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileCategory?: string;
    fileIcon?: string;
    downloadUrl: string;
  };
}

// Call types
export type CallType = "video" | "audio";

// Connection state
export interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

// WebRTC state interface
export interface WebRTCState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  pendingCandidates: RTCIceCandidate[];
}

// App state interface
export interface AppState {
  myInfo: UserInfo;
  currentRoom: string | null;
  partnerSid: string | null;
  partnerInfo: UserInfo | null;
  pendingRequest: ChatRequest | null;
  isInCall: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  callType: CallType | null;
}

// Socket event payloads
export interface SocketEventPayloads {
  // Connection events
  connect: void;
  disconnect: void;

  connection_established: { sid: string; ip: string; username: string };
  online_users_list: { users: UserInfo[] };

  // User events
  get_online_users: void;
  set_username: { username: string };

  // Chat events
  incoming_chat_request: ChatRequest;
  send_chat_request: { target_sid: string };

  // chat events
  file_received: {
    fileId: string;
    fileName: string;
    originalName?: string;
    fileSize: number;
    fileType: string;
    fileCategory?: string;
    fileIcon?: string;
    downloadUrl: string;
    timestamp?: string;
    from_sid?: string;
  };

  chat_request_accepted: {
    room_id: string;
    partner_sid: string;
    partner_username: string;
    partner_ip: string;
  };
  accept_chat_request: { request_id: string };
  chat_started: {
    room_id: string;
    partner_sid: string;
    partner_username: string;
    partner_ip: string;
  };
  chat_request_rejected: { by_username: string };
  reject_chat_request: { request_id: string };
  receive_private_message: {
    from_sid: string;
    from_username: string;
    message: string;
    timestamp: string;
  };
  send_private_message: {
    room_id: string;
    message: string;
    timestamp: string;
  };
  partner_left_chat: PartnerLeftData;
  leave_chat: { room_id: string };

  // Call events
  incoming_call: CallRequest;
  start_call: {
    target_sid: string;
    call_type: CallType;
  };
  call_accepted: {
    room_id: string;
    partner_sid: string;
    call_type: CallType;
  };
  accept_call: { request_id: string };
  call_started: {
    room_id: string;
    partner_sid: string;
    call_type: CallType;
  };
  call_rejected: { by_username: string };
  reject_call: { request_id: string };
  call_ended: { ended_by: string };
  end_call: { room_id: string };

  // WebRTC events
  webrtc_offer: {
    target_sid: string;
    offer: RTCSessionDescriptionInit;
    from_sid: string;
  };
  webrtc_answer: {
    target_sid: string;
    answer: RTCSessionDescriptionInit;
    from_sid: string;
  };
  webrtc_ice_candidate: {
    target_sid: string;
    candidate: RTCIceCandidateInit;
    from_sid: string;
  };
  webrtc_call_ended: Record<string, never>;
}

export interface SocketEmitPayloads {
  get_online_users: void;
  set_username: { username: string };
  send_chat_request: { target_sid: string };
  accept_chat_request: { request_id: string };
  reject_chat_request: { request_id: string };
  send_private_message: {
    room_id: string;
    message: string;
    timestamp: string;
  };
  leave_chat: { room_id: string };
  start_call: {
    target_sid: string;
    call_type: CallType;
  };
  accept_call: { request_id: string };
  reject_call: { request_id: string };
  end_call: { room_id: string };
  webrtc_offer: {
    target_sid: string;
    offer: RTCSessionDescriptionInit;
    from_sid: string;
  };
  webrtc_answer: {
    target_sid: string;
    answer: RTCSessionDescriptionInit;
    from_sid: string;
  };
  webrtc_ice_candidate: {
    target_sid: string;
    candidate: RTCIceCandidateInit;
    from_sid: string;
  };
}

// Toast notification
export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

// Extend RTCIceCandidateInit type to fix property 'type' error
declare global {
  interface RTCIceCandidateInit {
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  }
}

// User Types
export type UserStatus = "online" | "offline" | "busy" | "in_call";

// Request Types
export type RequestType = "chat" | "call";

export interface BaseRequest {
  request_id: string;
  from_sid: string;
  from_username: string;
  type: RequestType;
  timestamp: string;
}

export interface ChatState {
  myInfo: UserInfo;
  onlineUsers: UserInfo[];
  currentRoom: string | null;
  partnerSid: string | null;
  partnerInfo: UserInfo | null;
  pendingChatRequest: ChatRequest | null;
  messages: Message[];
  connected: boolean;
}

// Event Data Types
export interface ConnectionEstablishedData {
  sid: string;
  ip: string;
  username: string;
}

export interface OnlineUsersData {
  users: UserInfo[];
}

export interface ChatStartedData {
  room_id: string;
  partner_sid: string;
  partner_username: string;
  partner_ip: string;
}

export interface PrivateMessageData {
  from_sid: string;
  from_username: string;
  message: string;
  timestamp: string;
}

export interface PartnerLeftData {
  username: string;
  room_id: string;
}

export interface ChatRequest {
  request_id: string;
  from_sid: string;
  from_username: string;
  from_ip: string;
}

export interface CallRequest {
  request_id: string;
  from_sid: string;
  from_username: string;
  from_ip: string;
  call_type: CallType;
}

// Helper types for socket service
export type SocketEvent = keyof SocketEventPayloads;
export type SocketEventData<T extends SocketEvent> = SocketEventPayloads[T];
