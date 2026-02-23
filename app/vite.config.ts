import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-dom/client",
      "@tanstack/react-query",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-base",
      "@coral-xyz/anchor",
      "@solana/web3.js",
      "framer-motion",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-dom/client",
      "@tanstack/react-query",
      "@solana/wallet-adapter-react",
      "framer-motion",
    ],
    force: true,
    esbuildOptions: {
      target: "esnext",
    },
  },
  cacheDir: "node_modules/.vite_v5",
}));
