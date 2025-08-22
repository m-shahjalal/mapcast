"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        progress === 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-8 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500"></div>

            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="translate-x-1"
              />
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-cyan-400 animate-ping" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-blue-400/30 animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>
    </div>
  );
};
