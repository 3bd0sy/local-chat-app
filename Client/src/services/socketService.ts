/**
 * Socket.IO service for real-time communication
 */

import { io, Socket } from "socket.io-client";
import type { SocketEventPayloads } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    // Get server URL from environment variable or use default
    this.serverUrl = import.meta.env.VITE_API_URL;
    console.log("🔌 Socket.IO Server URL:", this.serverUrl);
  }

  /**
   * Connect to the socket server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      console.log(" Already connected to socket server");
      return this.socket;
    }

    console.log("Connecting to socket server...");

    this.socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      secure: true,
      rejectUnauthorized: false, // For self-signed certificates
    });

    // Connection event listeners for debugging
    this.socket.on("connect", () => {
      console.log(" Connected to socket server:", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("⚠️ Disconnected from server:", reason);
    });

    return this.socket;
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Emit an event to the server
   */
  emit<K extends keyof SocketEventPayloads>(event: K, data?: any): void {
    if (this.socket) {
      this.socket.emit(event as string, data);
    }
  }

  /**
   * Listen to an event from the server
   */
  on<K extends keyof SocketEventPayloads>(
    event: K,
    callback: (data: SocketEventPayloads[K]) => void
  ): void {
    if (this.socket) {
      this.socket.on(event as string, callback);
    }
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SocketEventPayloads>(
    event: K,
    callback?: (data: SocketEventPayloads[K]) => void
  ): void {
    if (this.socket) {
      this.socket.off(event as string, callback);
    }
  }

  /**
   * Listen to an event once
   */
  once<K extends keyof SocketEventPayloads>(
    event: K,
    callback: (data: SocketEventPayloads[K]) => void
  ): void {
    if (this.socket) {
      this.socket.once(event as string, callback);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
