"use client";

import { cn } from "@/utils/cn";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";

const InstallPrompt = () => {
  const [prompt, setPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)");
    if (isStandalone.matches) return;

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      setIsInstallable(true);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 10_000);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
    setIsInstallable(false);
    setIsVisible(false);
  };

  if (!isInstallable || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50",
        "bg-primary text-primary-foreground shadow-lg rounded-lg",
        "px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3",
        "sm:min-w-[320px] sm:max-w-md",
        "animate-in slide-in-from-top-2 duration-300"
      )}
    >
      <Download className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Install App</p>
        <p className="text-xs opacity-90">Quick home screen access</p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="secondary"
          onClick={install}
          className="text-xs h-7 px-2 sm:px-3"
        >
          Install
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="h-7 w-7 p-0 hover:bg-primary-foreground/20"
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
