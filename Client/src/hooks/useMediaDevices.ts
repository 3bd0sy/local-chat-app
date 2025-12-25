import { useState, useEffect, useCallback } from "react";

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [cameras, setCameras] = useState<MediaDevice[]>([]);
  const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
  const [speakers, setSpeakers] = useState<MediaDevice[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string>("");

  // Get all devices
  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const allDevices = deviceList.map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 5)}`,
        kind: device.kind,
      }));

      setDevices(allDevices);

      // Filter by type
      setCameras(allDevices.filter((d) => d.kind === "videoinput"));
      setMicrophones(allDevices.filter((d) => d.kind === "audioinput"));
      setSpeakers(allDevices.filter((d) => d.kind === "audiooutput"));
    } catch (error) {
      console.error("Error getting devices:", error);
    }
  }, []);

  // Switch camera
  const switchCamera = useCallback(
    async (
      deviceId: string,
      stream: MediaStream | null
    ): Promise<MediaStream | null> => {
      try {
        // Stop current video track
        if (stream) {
          stream.getVideoTracks().forEach((track) => track.stop());
        }

        // Get new stream with selected camera
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: true,
        });

        setCurrentCamera(deviceId);
        return newStream;
      } catch (error) {
        console.error("Error switching camera:", error);
        return null;
      }
    },
    []
  );

  // Get front/back camera on mobile
  const getFacingMode = useCallback(
    async (
      mode: "user" | "environment",
      stream: MediaStream | null
    ): Promise<MediaStream | null> => {
      try {
        if (stream) {
          stream.getVideoTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: true,
        });

        return newStream;
      } catch (error) {
        console.error("Error getting camera:", error);
        return null;
      }
    },
    []
  );

  // Initialize
  useEffect(() => {
    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, [getDevices]);

  return {
    devices,
    cameras,
    microphones,
    speakers,
    currentCamera,
    switchCamera,
    getFacingMode,
    refreshDevices: getDevices,
  };
};
