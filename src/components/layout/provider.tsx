"use client";

import { MapProvider } from "@/config/map-context";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { PwaManager } from "./pwa/push-manager";
import { SplashScreen } from "./pwa/splash-screen";
import { SpinnerProvider } from "./loader-provider";

const Providers = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 100)

    return () => {
      window.addEventListener("beforeunload", () =>
        localStorage.setItem("theme", "system")
      );
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }


  return (
    <div
      className={`transition-opacity duration-300 ${
        isClient ? "opacity-100" : "opacity-0"
      }`}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NextTopLoader color="#3b82f6" showSpinner={false} height={3} />
        <MapProvider>{children}</MapProvider>
        <Toaster
          position="top-right"
          duration={5000}
          expand
          visibleToasts={3}
          richColors
        />
        <PwaManager />
      </ThemeProvider>
    </div>
  );
};

export default Providers;
