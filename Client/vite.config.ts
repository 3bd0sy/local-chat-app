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
        path.resolve(
          __dirname,
          "certificate/localhost+2-key.pem" /*"certificate/key.pem"*/
        )
      ),
      cert: fs.readFileSync(
        path.resolve(
          __dirname,
          "certificate/localhost+2.pem" /*"certificate/cert.pem"*/
        )
      ),
    }, //true,
    port: 5173,
    host: "0.0.0.0", // true,
    proxy: {
      "/socket.io": {
        target: "https://173.10.10.244:5000",
        ws: true,
        changeOrigin: true,
        secure: false, // Accept self-signed certificates
        rewrite: (path) => {
          console.log("Proxying:", path);
          return path;
        },
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("❌ Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("📤 Proxying:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("📥 Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
