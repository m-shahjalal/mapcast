"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebApp);

    // Check if user previously dismissed
    const isDismissed =
      localStorage.getItem("pwa-install-dismissed") === "true";
    if (isDismissed) return;

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS, show install prompt after user engagement
    if (isIOSDevice && !isStandalone && !isInWebApp) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // Increased to 5 seconds for better UX
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
        }
      } catch (error) {
        console.log("Install prompt error:", error);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed, not ready, or user dismissed
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Install PiNews
          </h3>

          {isIOS ? (
            <p className="text-xs text-gray-600 mb-3">
              Tap the <span className="font-semibold">Share</span> button, then
              select <span className="font-semibold">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-xs text-gray-600 mb-3">
              Get instant access to news updates from your home screen
            </p>
          )}

          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Install Now
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="text-gray-500 text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
