import { io, Socket } from "socket.io-client";
import type { SocketEventPayloads } from "../types";
import { serverConfig } from "../serverConfig";

type EventHandler<K extends keyof SocketEventPayloads> = (
  data: SocketEventPayloads[K]
) => void;

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private eventHandlers: Map<string, EventHandler<any>[]> = new Map();
  private isConnected = false;
  private connectionPromise: Promise<Socket> | null = null;

  constructor() {
    const url = serverConfig.apiUrl;

    this.serverUrl = url || "http://localhost:5000";
  }

  connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        timeout: 10000,
        rejectUnauthorized: false,
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
        resolve(this.socket!);
        this.connectionPromise = null;
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
        reject(error);
        this.connectionPromise = null;
      });

      this.socket.on("disconnect", () => {
        this.isConnected = false;
      });
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    this.eventHandlers.clear();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionPromise = null;
  }

  on<K extends keyof SocketEventPayloads>(
    event: K,
    handler: EventHandler<K>
  ): () => void {
    const handlers = this.eventHandlers.get(event) || [];

    if (handlers.includes(handler)) {
      console.warn(`⚠️ Handler already registered for event: ${event}`);
      return () => this.off(event, handler);
    }

    handlers.push(handler);
    this.eventHandlers.set(event, handlers);

    const socketHandler = (data: any) => {
      handler(data);
    };

    this.socket?.on(event as string, socketHandler);

    return () => {
      this.off(event, handler);
    };
  }

  off<K extends keyof SocketEventPayloads>(
    event: K,
    handler?: EventHandler<K>
  ): void {
    if (!handler) {
      this.eventHandlers.delete(event);
      this.socket?.off(event as string);
      return;
    }

    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);

    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(event, handlers);
      this.socket?.off(event as string, handler as any);
    }
  }

  emit<K extends keyof SocketEventPayloads>(
    event: K,
    data?: SocketEventPayloads[K],
    acknowledge?: (response: any) => void
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        console.warn(
          `⚠️ Socket not connected for event: ${event}, attempting to reconnect...`
        );

        try {
          await this.connect();
        } catch (err) {
          const error = `Cannot emit ${event}: Socket not connected`;
          console.warn(`⚠️ ${error}`);
          reject(new Error(error));
          return;
        }
      }
      if (!this.socket || !this.isConnected) {
        const error = `Cannot emit ${event}: Socket still not connected`;
        console.error(`❌ ${error}`);
        reject(new Error(error));
        return;
      }

      const emitData: any = data ? { ...data } : {};

      emitData.timestamp = new Date().toISOString();

      const eventsRequiringFromSid = [
        "webrtc_offer",
        "webrtc_answer",
        "webrtc_ice_candidate",
      ];

      if (eventsRequiringFromSid.includes(event as string)) {
        const socketId = this.getSocketId();
        if (socketId) {
          emitData.from_sid = socketId;
        } else {
          console.warn(
            `⚠️ Cannot get socket ID for event: ${event}, sending without from_sid`
          );
        }
      }

      try {
        if (acknowledge) {
          this.socket.emit(event as string, emitData, (response: any) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else {
              acknowledge(response);
              resolve(response);
            }
          });
        } else {
          this.socket.emit(event as string, emitData);
          resolve(undefined);
        }
      } catch (error) {
        console.error(`❌ Error emitting ${event}:`, error);
        if (
          event === "webrtc_offer" ||
          event === "webrtc_answer" ||
          event === "webrtc_ice_candidate"
        ) {
          console.warn(`🔄 Retrying ${event} in 100ms...`);
          setTimeout(() => {
            this.emit(event, data, acknowledge).then(resolve).catch(reject);
          }, 100);
        } else {
          reject(error);
        }
      }
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnectedState(): boolean {
    return this.isConnected;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.eventHandlers.delete(event);
      this.socket?.removeAllListeners(event);
    } else {
      this.eventHandlers.clear();
      this.socket?.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
