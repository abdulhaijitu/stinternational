import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance: Disable React DevTools in production
if (import.meta.env.PROD && typeof window !== "undefined") {
  // @ts-ignore
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
}

createRoot(document.getElementById("root")!).render(
  import.meta.env.DEV ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
