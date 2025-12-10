/**
 * Empty State Component
 */
import { Users } from "lucide-react";

const EmptyState: React.FC = () => (
  <div className="h-full flex items-center justify-center py-8">
    <div className="text-center space-y-4 px-4 max-w-xs">
      {/* Animated Icon */}
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Users className="w-10 h-10 text-white/30" />
        </div>
      </div>

      {/* Message */}
      <div>
        <h3 className="text-white/70 font-semibold mb-1.5">
          No one's here yet
        </h3>
        <p className="text-white/40 text-sm leading-relaxed">
          You're the first one online. Share the link to start connecting!
        </p>
      </div>

      {/* Decorative Dots */}
      <div className="flex gap-2 justify-center pt-2">
        <div
          className="w-2 h-2 rounded-full bg-white/10 animate-pulse"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-white/20 animate-pulse"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-white/10 animate-pulse"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  </div>
);

export default EmptyState;
