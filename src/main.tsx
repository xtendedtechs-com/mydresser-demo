import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyDresserApp from "./MyDresserApp.tsx";
import TerminalApp from "./TerminalApp.tsx";
import "./index.css";

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
