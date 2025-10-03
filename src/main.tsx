import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyDresserApp from "./MyDresserApp.tsx";
import TerminalApp from "./TerminalApp.tsx";
import "./index.css";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
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

// Router wrapper to handle both apps
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/terminal/*" element={<TerminalApp />} />
        <Route path="*" element={<MyDresserApp />} />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<AppRouter />);
