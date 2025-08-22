"use client";

import { MapProvider } from "@/config/map-context";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { PwaManager } from "./pwa/push-manager";
import { SplashScreen } from "./pwa/splash-screen";

const Providers = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setIsClient(true);

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
      <SWRConfig
        value={{
          refreshInterval: 3000,
          fetcher: (r, i) => fetch(r, i).then((res) => res.json()),
          provider: () => new Map(),
        }}
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
      </SWRConfig>
    </div>
  );
};

export default Providers;
