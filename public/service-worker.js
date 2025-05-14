// public/service-worker.js

self.addEventListener("install", (event) => {
    console.log("✅ Service Worker installed");
    self.skipWaiting(); // Force immediate activation
  });
  
  self.addEventListener("activate", (event) => {
    console.log("🔁 Service Worker activated");
    return self.clients.claim(); // Take control of open clients immediately
  });
  
  self.addEventListener("fetch", (event) => {
    // Default behavior: let the browser handle everything
    // Optional: add custom caching or offline logic here
  });
  