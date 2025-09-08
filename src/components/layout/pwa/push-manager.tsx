"use client";

import { cn } from "@/utils/cn";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";

const STORAGE_KEY = "pwa-install-prompt-shown";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const getToday = () => new Date().toDateString();

  const hasShownToday = () => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      return lastShown === getToday();
    } catch {
      return false;
    }
  };

  const markAsShownToday = () => {
    try {
      localStorage.setItem(STORAGE_KEY, getToday());
    } catch {}
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("PWA install prompt triggered");
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);

      if (!hasShownToday()) {
        setIsVisible(true);
        markAsShownToday();

        setTimeout(() => setIsVisible(false), 15000);
      }
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn("No deferred prompt available");
      return;
    }

    try {
      const result = await deferredPrompt.prompt();
      console.log("Install prompt result:", result);

      const choiceResult = await deferredPrompt.userChoice;
      console.log("User choice:", choiceResult.outcome);

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
      setCanInstall(false);
      setIsVisible(false);
    } catch (error) {
      console.error("Error during installation:", error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!canInstall || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50",
        "bg-primary text-primary-foreground shadow-lg rounded-lg border",
        "px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3",
        "sm:min-w-[320px] sm:max-w-md",
        "animate-in slide-in-from-top-2 duration-300"
      )}
    >
      <Download className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Install App</p>
        <p className="text-xs opacity-90">
          Add to home screen for quick access
        </p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleInstall}
          className="text-xs h-7 px-2 sm:px-3 font-medium"
        >
          Install
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-7 w-7 p-0 hover:bg-primary-foreground/20"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};

export function PwaManager() {
  return <InstallPrompt />;
}
