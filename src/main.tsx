import { createRoot } from "react-dom/client";
import MyDresserApp from "./MyDresserApp.tsx";
import TerminalApp from "./TerminalApp.tsx";
import "./index.css";

// Route to the correct app based on URL
const isTerminal = window.location.pathname.startsWith('/terminal');
const AppComponent = isTerminal ? TerminalApp : MyDresserApp;

createRoot(document.getElementById("root")!).render(<AppComponent />);
