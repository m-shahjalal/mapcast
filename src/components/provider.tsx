"use client";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";

const Providers = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

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
          {children}
          <Toaster
            position="top-right"
            duration={5000}
            expand
            visibleToasts={3}
            richColors
          />
        </ThemeProvider>
      </SWRConfig>
    </div>
  );
};

export default Providers;
