import React, { ReactNode, useEffect } from "react";
import { ToastProvider } from "./ToastProvider";
import { ChatProvider } from "../contexts/ChatContext";
import { CallProvider } from "../contexts/CallContext";
import { socketService } from "../services/socketService";
import { webrtcService } from "../services/webrtcService";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
      webrtcService.cleanup();
    };
  }, []);

  return (
    <ToastProvider>
      <ChatProvider>
        <CallProvider>{children}</CallProvider>
      </ChatProvider>
    </ToastProvider>
  );
};
