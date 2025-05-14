// src/components/InstallPrompt.tsx
import React, { useEffect, useState } from "react";

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [supportsInstall, setSupportsInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setSupportsInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Fallback: if Chrome install prompt isn’t fired, still show button
    setTimeout(() => {
      if (window.matchMedia('(display-mode: browser)').matches) {
        setSupportsInstall(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        console.log("✅ User installed the app");
      } else {
        console.log("❌ User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    } else {
      // Desktop fallback
      alert(
        "If you don’t see an install prompt, open the Chrome menu (⋮) and select 'Install MandoBots'."
      );
    }
  };

  if (!supportsInstall) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-xl shadow-lg hover:bg-red-600 transition-all"
    >
      Install MandoBots
    </button>
  );
};

export default InstallPrompt;
