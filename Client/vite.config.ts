import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "certificate/localhost+2-key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "certificate/localhost+2.pem")
      ),
    },
    port: 5173,
    host: "0.0.0.0", // true,
  },
});
