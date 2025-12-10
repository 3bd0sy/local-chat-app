// Toggle fullscreen
export const toggleFullscreen = (
  containerId: string,
  isFullscreen: boolean,
  setIsFullscreen: (s: boolean) => void
) => {
  const elem = document.getElementById(containerId);
  console.log(isFullscreen);

  if (!elem) return;

  // If not fullscreen -> request
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      console.error("Fullscreen error:", err);
    });
    setIsFullscreen(true);
    return;
  }

  // If fullscreen -> exit
  document.exitFullscreen();
  setIsFullscreen(false);
};

// Toggle speaker
export const toggleSpeaker = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isMuted: boolean,
  setMuted: (s: boolean) => void
) => {
  if (videoRef.current) {
    videoRef.current.muted = !isMuted;
    setMuted(!isMuted);
  }
};

// Format call duration
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Handle control display
export const handleMouseMove = (setShowControls: (b: boolean) => void) => {
  setShowControls(true);
};
