import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./muppet-stock-screener.jsx";

// Mock window.storage using localStorage so the app works in a plain browser
window.storage = {
  get: async (key) => {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
