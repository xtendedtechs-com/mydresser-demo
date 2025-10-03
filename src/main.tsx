import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthWrapper } from "@/components/AuthWrapper";
import TerminalApp from "./TerminalApp.tsx";
import "./index.css";

// Ensure React default is available for libraries expecting it
// and avoid null default in prebundled chunks
// @ts-ignore
(globalThis as any).React = React;

// PWA service worker: only register in production, clean up in dev to avoid caching issues
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
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
  } else {
    // In dev, make sure to unregister any existing SW to prevent stale caches
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
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
