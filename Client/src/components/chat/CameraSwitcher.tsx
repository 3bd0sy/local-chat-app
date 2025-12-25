import React from "react";
import { Camera, Smartphone } from "lucide-react";
import { useMediaDevices } from "../../hooks/useMediaDevices";

interface CameraSwitcherProps {
  currentStream: MediaStream | null;
  onStreamChange: (stream: MediaStream) => void;
}

const CameraSwitcher: React.FC<CameraSwitcherProps> = ({
  currentStream,
  onStreamChange,
}) => {
  const { cameras, switchCamera, getFacingMode } = useMediaDevices();
  const [isMobile, setIsMobile] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">(
    "user"
  );

  React.useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleSwitchCamera = async (deviceId: string) => {
    const newStream = await switchCamera(deviceId, currentStream);
    if (newStream) {
      onStreamChange(newStream);
    }
  };

  const handleFlipCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    const newStream = await getFacingMode(newMode, currentStream);
    if (newStream) {
      setFacingMode(newMode);
      onStreamChange(newStream);
    }
  };

  return (
    <div className="relative">
      {isMobile ? (
        <button
          onClick={handleFlipCamera}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          title="Flip camera"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-white/70" />
          <select
            onChange={(e) => handleSwitchCamera(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-primary-500"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CameraSwitcher;
