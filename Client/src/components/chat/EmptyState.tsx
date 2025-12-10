import { Paperclip, Send, Video } from "lucide-react";

/**
 * Empty State Component
 */
const EmptyState: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      {/* Animated Icon */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-32 h-32 rounded-full bg-linear-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center">
          <Send className="w-16 h-16 text-primary-400" />
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-display font-bold mb-3 bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
        Welcome to Chat App
      </h2>
      <p className="text-white/50 text-lg mb-6">
        Select a user from the sidebar to start chatting
      </p>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Send className="w-6 h-6 text-primary-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">Instant Messages</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Video className="w-6 h-6 text-accent-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">Video Calls</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Paperclip className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-xs text-white/60">File Sharing</p>
        </div>
      </div>
    </div>
  </div>
);

export default EmptyState;
