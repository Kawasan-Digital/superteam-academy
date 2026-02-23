import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { analytics } from "./services/analytics";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize analytics
analytics.init();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
