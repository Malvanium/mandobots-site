// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css'; // ✅ Ensure Tailwind or other CSS loads
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"; // ✅ Import registration

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Register the service worker for PWA installation
serviceWorkerRegistration.register();
