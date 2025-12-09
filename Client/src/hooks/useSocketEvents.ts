import { useEffect, useRef } from "react";
import { socketService } from "../services/socketService";
// import type { SocketEventPayloads } from "../types";
export const useSocketEvents = (handlers: any) => {
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
        const cleanup = socketService.on(event, handler);
        cleanupRef.current.push(cleanup);
      }
    });
    // (Object.keys(handlers) as Array<keyof SocketEventPayloads>).forEach(
    //   (event) => {
    //     const handler = handlers[event];
    //     if (handler && typeof handler === "function") {
    //       const cleanup = socketService.on(event, handler);
    //       cleanupRef.current.push(cleanup);
    //     }
    //   }
    // );

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
