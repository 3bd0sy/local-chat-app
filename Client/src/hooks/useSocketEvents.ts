import { useEffect, useRef } from "react";
import { socketService } from "../services/socketService";
import { SocketEventPayloads, SocketEvent } from "../types";
export const useSocketEvents = (
  handlers: Partial<{
    [K in SocketEvent]: (data: SocketEventPayloads[K]) => void;
  }>
) => {
  const cleanupRef = useRef<(() => void)[]>([]);
  const isCleaningRef = useRef(false);

  useEffect(() => {
    if (isCleaningRef.current) return;

    cleanupRef.current.forEach((cleanup) => {
      try {
        cleanup();
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
    });
    cleanupRef.current = [];

    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler && typeof handler === "function") {
        const cleanup = socketService.on(event as SocketEvent, handler as any);
        cleanupRef.current.push(cleanup);
      }
    });

    return () => {
      isCleaningRef.current = true;
      cleanupRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (err) {
          console.warn("Unmount cleanup error:", err);
        }
      });
      cleanupRef.current = [];
      isCleaningRef.current = false;
    };
  }, []);
};
