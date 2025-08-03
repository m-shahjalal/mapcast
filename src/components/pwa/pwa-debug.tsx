"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Smartphone } from "lucide-react";

export default function PWADebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      const info = {
        // Basic browser support
        hasServiceWorker: "serviceWorker" in navigator,
        hasNotifications: "Notification" in window,
        hasPushManager: "PushManager" in window,
        // Install status
        isStandalone: window.matchMedia("(display-mode: standalone)").matches,
        isInWebApp: (window.navigator as any).standalone === true,
        // Device detection
        userAgent: navigator.userAgent,
        isAndroid: /android/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isChrome: /chrome/i.test(navigator.userAgent),
        isFirefox: /firefox/i.test(navigator.userAgent),
        isSafari:
          /safari/i.test(navigator.userAgent) &&
          !/chrome/i.test(navigator.userAgent),
        // Security
        isHTTPS: location.protocol === "https:",
        isLocalhost:
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1",
        // PWA requirements
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        manifestUrl: document
          .querySelector('link[rel="manifest"]')
          ?.getAttribute("href"),
        // Current URL info
        currentUrl: window.location.href,
        origin: window.location.origin,
        // Viewport
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        // Service Worker status
        swController: !!navigator.serviceWorker?.controller,
        swReady: false,
      };

      // Check service worker ready state
      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(() => {
          setDebugInfo((prev: any) => ({ ...prev, swReady: true }));
        });
      }

      setDebugInfo(info);
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt to see if it fires
    const handleBeforeInstall = (e: Event) => {
      setDebugInfo((prev: any) => ({
        ...prev,
        beforeInstallPromptFired: true,
        beforeInstallPromptTime: new Date().toLocaleTimeString(),
      }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const StatusIcon = ({ condition }: { condition: boolean }) =>
    condition ? (
      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
    );

  const testManifest = async () => {
    try {
      const response = await fetch("/manifest.json");
      const manifest = await response.json();
      console.log("Manifest loaded successfully:", manifest);
      alert("Manifest loaded successfully! Check console for details.");
    } catch (error) {
      console.error("Manifest error:", error);
      alert("Manifest failed to load! Check console for error details.");
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Debug toggle button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-4 right-4 bg-orange-500 dark:bg-orange-600 text-white p-2 rounded-full shadow-lg z-50 hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
        title="PWA Debug Info"
      >
        <AlertCircle className="w-4 h-4" />
      </button>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Smartphone className="w-5 h-5" />
                  PWA Debug Information
                </h2>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* PWA Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  PWA Requirements
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      condition={debugInfo.isHTTPS || debugInfo.isLocalhost}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      HTTPS or Localhost:{" "}
                      {debugInfo.isHTTPS
                        ? "HTTPS"
                        : debugInfo.isLocalhost
                        ? "Localhost"
                        : "HTTP (❌ Need HTTPS)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon condition={debugInfo.hasManifest} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Manifest: {debugInfo.manifestUrl || "Not found"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon condition={debugInfo.hasServiceWorker} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Service Worker Support:{" "}
                      {debugInfo.hasServiceWorker ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon condition={debugInfo.swReady} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Service Worker Ready: {debugInfo.swReady ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device & Browser Info */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Device & Browser
                </h3>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    Platform:{" "}
                    {debugInfo.isAndroid
                      ? "📱 Android"
                      : debugInfo.isIOS
                      ? "📱 iOS"
                      : "💻 Desktop"}
                  </div>
                  <div>
                    Browser:{" "}
                    {debugInfo.isChrome
                      ? "Chrome"
                      : debugInfo.isFirefox
                      ? "Firefox"
                      : debugInfo.isSafari
                      ? "Safari"
                      : "Other"}
                  </div>
                  <div>
                    Viewport: {debugInfo.viewportWidth} ×{" "}
                    {debugInfo.viewportHeight}
                  </div>
                </div>
              </div>

              {/* Install Status */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Installation Status
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      condition={debugInfo.isStandalone || debugInfo.isInWebApp}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Already Installed:{" "}
                      {debugInfo.isStandalone || debugInfo.isInWebApp
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      condition={debugInfo.beforeInstallPromptFired}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Install Prompt Available:{" "}
                      {debugInfo.beforeInstallPromptFired
                        ? `Yes (${debugInfo.beforeInstallPromptTime})`
                        : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Debug Actions
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={testManifest}
                    className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  >
                    Test Manifest
                  </button>
                  <button
                    onClick={() => {
                      console.log("Full Debug Info:", debugInfo);
                      alert("Debug info logged to console!");
                    }}
                    className="bg-green-500 dark:bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                  >
                    Log to Console
                  </button>
                </div>
              </div>

              {/* Android Specific */}
              {debugInfo.isAndroid && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Android Install Tips
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>
                      • Make sure you're using Chrome, Edge, or Samsung Internet
                    </li>
                    <li>
                      • The beforeinstallprompt event should fire within ~30
                      seconds
                    </li>
                    <li>• Try refreshing the page if no prompt appears</li>
                    <li>
                      • Check Chrome's "Add to Home screen" in the menu (⋮)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
