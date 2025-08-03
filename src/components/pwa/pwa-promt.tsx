"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detect device types
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    const isInstallable = isStandalone || isInWebApp;

    setIsInstalled(isInstallable);

    // Don't show if already dismissed recently
    const dismissedTime = localStorage.getItem("pwa-install-dismissed-time");
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours

    if (dismissedTime && now - parseInt(dismissedTime) < oneDayMs) {
      return;
    }

    // Handle beforeinstallprompt event (Android Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);

      // Show prompt after short delay for better UX
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setCanInstall(false);
      localStorage.removeItem("pwa-install-dismissed-time");
    };

    // Add event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS devices - show manual install instructions
    if (isIOSDevice && !isInstallable) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    }

    // For Android devices without beforeinstallprompt - fallback
    if (isAndroidDevice && !isInstallable) {
      // Check if PWA criteria are met manually
      const timer = setTimeout(() => {
        if (!deferredPrompt && !isInstallable) {
          console.log("Android fallback: showing manual install prompt");
          setShowInstallPrompt(true);
        }
      }, 8000);

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        console.log("Showing install prompt");
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log("User choice:", outcome);

        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
          setCanInstall(false);
        } else {
          console.log("User dismissed the install prompt");
          handleDismiss();
        }
      } catch (error) {
        console.error("Install prompt error:", error);
        // Fallback to manual instructions
        setShowManualInstructions(true);
      }
    } else {
      // No native prompt available, show manual instructions
      setShowManualInstructions(true);
    }
  };

  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowManualInstructions(false);
    // Remember dismissal for 24 hours
    localStorage.setItem("pwa-install-dismissed-time", Date.now().toString());
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if not ready
  if (!showInstallPrompt && !showManualInstructions) {
    return null;
  }

  return (
    <>
      {/* Main install prompt */}
      {showInstallPrompt && (
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
                  Tap the <span className="font-semibold">Share</span> button{" "}
                  <span className="inline-block">⎋</span>, then select{" "}
                  <span className="font-semibold">Add to Home Screen</span>{" "}
                  <span className="inline-block">➕</span>
                </p>
              ) : isAndroid ? (
                <p className="text-xs text-gray-600 mb-3">
                  {canInstall
                    ? "Get instant access with offline reading"
                    : "Tap menu (⋮) → 'Add to Home screen' or 'Install app'"}
                </p>
              ) : (
                <p className="text-xs text-gray-600 mb-3">
                  Get instant access to news updates from your home screen
                </p>
              )}

              <div className="flex gap-2">
                {!isIOS && (canInstall || isAndroid) && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    {canInstall ? "Install Now" : "Show Instructions"}
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
      )}

      {/* Manual instructions modal for Android */}
      {showManualInstructions && isAndroid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install PiNews</h3>
                <p className="text-sm text-gray-600">Add to your home screen</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span>
                  Tap the <strong>menu button</strong> (⋮) in your browser
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span>
                  Look for <strong>"Add to Home screen"</strong> or{" "}
                  <strong>"Install app"</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span>
                  Tap <strong>"Add"</strong> or <strong>"Install"</strong> to
                  confirm
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
