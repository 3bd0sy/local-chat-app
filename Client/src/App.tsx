/**
 * Main App Component
 * Root component that brings everything together
 */

import React from "react";
import { ChatProvider } from "./contexts/ChatContext";
import Sidebar from "./components/sidebar/Sidebar";
import Chat from "./components/chat/Chat";
import { VideoCall } from "./components/VideoCall";
import { RequestModal } from "./components/RequestModal";
import { ToastContainer } from "./components/Toast";
import "./styles/index.css";
import { CallProvider } from "./contexts/CallContext";
import { ToastProvider } from "./providers/ToastProvider";

const App: React.FC = () => {
  return (
    <>
      <ToastProvider>
        <ChatProvider>
          <CallProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar with users */}
              <Sidebar />

              {/* Main chat area */}
              <Chat />

              {/* Video call overlay */}
              <VideoCall />

              {/* Request modal */}
              <RequestModal />

              {/* Toast notifications */}
              <ToastContainer />
            </div>
          </CallProvider>
        </ChatProvider>
      </ToastProvider>
    </>
  );
};

export default App;
