// Generate dynamic server URL based on current machine IP/hostname
// React app and backend server run on the same machine
// Only the port differs

const SERVER_PORT = 5000; // change when needed

export const serverConfig = {
  apiUrl: `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`,
};
