import React, { useEffect, useState } from "react";

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));
    setIsInStandaloneMode(("standalone" in window.navigator) && (window.navigator as any).standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const result = await (deferredPrompt as any).userChoice;
      console.log("Install outcome:", result.outcome);
    } else if (isIos && !isInStandaloneMode) {
      alert("To install this app:\n\n1. Tap the Share button in Safari\n2. Select 'Add to Home Screen'");
    } else {
      alert("Installation is not supported on your device/browser.");
    }
  };

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
