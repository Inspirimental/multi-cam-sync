import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy HLS to bypass CORS in Chrome during development
      "/hls-proxy": {
        target: "https://sharing.timbeck.de/hls",
        changeOrigin: true,
        secure: false,
        // /hls-proxy/NCBSC_front/index.m3u8 -> https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8
        rewrite: (path) => path.replace(/^\/hls-proxy\/?/, "/"),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
}));
