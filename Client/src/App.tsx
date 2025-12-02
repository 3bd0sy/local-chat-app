/**
 * Main App Component
 * Root component that brings everything together
 */

import React from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { VideoCall } from "./components/VideoCall";
import { RequestModal } from "./components/RequestModal";
import { ToastContainer } from "./components/Toast";
import "./styles/index.css";

const App: React.FC = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar with users */}
        <Sidebar />

        {/* Main chat area */}
        <ChatArea />

        {/* Video call overlay */}
        <VideoCall />

        {/* Request modal */}
        <RequestModal />

        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </ChatProvider>
  );
};

export default App;
