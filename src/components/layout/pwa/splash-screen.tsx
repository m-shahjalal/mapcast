import Image from "next/image";
import React, { useState, useEffect } from "react";

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 transition-opacity duration-500 ${
        progress === 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>

      <div className="text-center space-y-8 relative z-10">
        {/* Logo Container */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            {/* Spinning Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white"></div>

            {/* Logo/Icon */}
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

          {/* Pulsing Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/30 animate-ping" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-white/20 animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-wide animate-fade-in">
            PiNews
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white to-blue-200 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
