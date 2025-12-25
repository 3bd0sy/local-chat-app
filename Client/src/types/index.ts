/**
 * Type definitions for the chat application
 */

export type UserStatus = "online" | "offline" | "busy" | "in_call";
export type CallType = "video" | "audio";
export type RequestType = "chat" | "call";
export type MessageType = "sent" | "received";
export type ToastType = "success" | "error" | "info" | "warning";

// Base Interfaces

interface BaseUserInfo {
  sid: string;
  username: string;
}

export interface UserInfo extends BaseUserInfo {
  ip: string;
  status: UserStatus;
  in_call?: boolean;
}

interface BaseRequest {
  request_id: string;
  from_sid: string;
  from_username: string;
  timestamp: string;
}

export interface BaseChatStartedData {
  room_id: string;
  partner_sid: string;
  partner_username: string;
  partner_ip: string;
}

// File Types

export interface FileData {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileCategory?: string;
  fileIcon?: string;
  downloadUrl: string;
}

export interface FileReceivedData extends FileData {
  originalName?: string;
  timestamp?: string;
  from_sid?: string;
}

// Message Types

export interface BaseMessage {
  id: string;
  from_sid: string;
  from_username: string;
  message: string;
  timestamp: string;
}

export interface Message extends BaseMessage {
  type: MessageType;
  fileData?: FileData;
}

// Request Types

export interface ChatRequest extends BaseRequest {
  type: "chat";
  from_ip: string;
}

export interface CallRequest extends BaseRequest {
  type: "call";
  from_ip: string;
  call_type: CallType;
}

export interface ConnectionEstablishedData extends BaseUserInfo {
  ip: string;
}

export interface OnlineUsersData {
  users: UserInfo[];
}

export interface ChatStartedData extends BaseChatStartedData {}

export interface PrivateMessageData extends BaseMessage {}

export interface PartnerLeftData {
  username: string;
  room_id: string;
}

// State Types

export interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export interface WebRTCState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  pendingCandidates: RTCIceCandidate[];
}

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

interface BaseSocketPayloads {
  // Connection events
  connect: void;
  disconnect: void;
  connection_established: ConnectionEstablishedData;
  online_users_list: OnlineUsersData;

  // User events
  get_online_users: void;
  set_username: { username: string };

  // Common events with request_id
  accept_request: { request_id: string };
  reject_request: { request_id: string };
}

interface ChatSpecificPayloads {
  // Chat events
  incoming_chat_request: ChatRequest;
  send_chat_request: { target_sid: string };
  chat_request_accepted: ChatStartedData;
  chat_started: ChatStartedData;
  chat_request_rejected: { by_username: string };
  receive_private_message: PrivateMessageData;
  send_private_message: {
    room_id: string;
    message: string;
    timestamp: string;
    messageId?: string;
  };
  partner_left_chat: PartnerLeftData;
  leave_chat: { room_id: string };
  reject_chat_request: { request_id: string };
  accept_chat_request: { request_id: string };
}

interface FileSpecificPayloads {
  // File events
  file_received: FileReceivedData;
}

interface CallSpecificPayloads {
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
}

interface WebRTCSpecificPayloads {
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

// Combined Socket Event Types

export type SocketEventPayloads = BaseSocketPayloads &
  ChatSpecificPayloads &
  FileSpecificPayloads &
  CallSpecificPayloads &
  WebRTCSpecificPayloads;

export type SocketEmitPayloads = Pick<
  SocketEventPayloads,
  | "get_online_users"
  | "set_username"
  | "send_chat_request"
  | "accept_chat_request"
  | "reject_chat_request"
  | "send_private_message"
  | "leave_chat"
  | "start_call"
  | "accept_call"
  | "reject_call"
  | "end_call"
  | "webrtc_offer"
  | "webrtc_answer"
  | "webrtc_ice_candidate"
>;

// Toast Notification

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Helper Types for Socket Service

export type SocketEvent = keyof SocketEventPayloads;
export type SocketEventData<T extends SocketEvent> = SocketEventPayloads[T];

// Type Extensions

declare global {
  interface RTCIceCandidateInit {
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  }
}

export function isChatRequest(request: any): request is ChatRequest {
  return request?.type === "chat";
}

export function isCallRequest(request: any): request is CallRequest {
  return request?.type === "call";
}

export function isMessage(message: any): message is Message {
  return (
    message &&
    typeof message.id === "string" &&
    typeof message.from_sid === "string" &&
    typeof message.message === "string"
  );
}
