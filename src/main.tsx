import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthWrapper } from "@/components/AuthWrapper";
import TerminalApp from "./TerminalApp.tsx";
import "./index.css";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        const sendSkipWaiting = () => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        };

        // Trigger immediate activation for updated SW
        if (registration.waiting) {
          sendSkipWaiting();
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                sendSkipWaiting();
              }
            });
          }
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <BrowserRouter>
      <Routes>
        <Route path="/terminal/*" element={<TerminalApp />} />
        <Route path="*" element={<AuthWrapper />} />
      </Routes>
    </BrowserRouter>
  </AppProviders>
);
