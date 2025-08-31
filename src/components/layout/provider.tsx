"use client";

import { MapProvider } from "@/config/map-context";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { PwaManager } from "./pwa/push-manager";
import { SSRLoader } from "./ssr-loader";

const Providers = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 100);

    return () => {
      window.addEventListener("beforeunload", () =>
        localStorage.setItem("theme", "system")
      );
    };
  }, []);

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
        <SSRLoader />
        <MapProvider>
          <div className="relative z-10">{children}</div>
        </MapProvider>
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
