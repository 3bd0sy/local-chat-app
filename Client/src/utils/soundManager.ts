// create audio loader with checks
function loadSound(src: string) {
  const audio = new Audio(src); // load file
  audio.preload = "auto"; // force preload
  audio.volume = 1.0; // adjust if needed

  // verify sound loaded
  audio.oncanplaythrough = () => {
    console.log(`Sound loaded: ${src}`); // debug
  };

  // verify loading error
  audio.onerror = () => {
    console.error(`Failed to load sound: ${src}`);
  };

  return audio;
}

export const sounds = {
  callRinging: loadSound("/sounds/call_ringing.wav"),
  messageReceive: loadSound("/sounds/message_receive.mp3"),
};
