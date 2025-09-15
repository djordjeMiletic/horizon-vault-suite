import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SessionProvider } from "./state/SessionContext";

createRoot(document.getElementById("root")!).render(
  <SessionProvider>
    <App />
  </SessionProvider>
);
