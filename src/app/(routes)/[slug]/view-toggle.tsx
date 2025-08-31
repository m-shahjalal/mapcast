"use client";

import { Button } from "@/components/ui/button";
import { Maximize, Minimize, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

declare global {
  interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
  }
  interface Document {
    webkitExitFullscreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
  }
}

export const ActionButtons = () => {
  const [isFull, setIsFull] = useState(false);

  // Listen for fullscreen changes to keep state in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFull(isCurrentlyFullscreen);
    };

    // Add event listeners for all browsers
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Add CSS to ensure fullscreen element is interactive
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :fullscreen {
        overflow: auto !important;
        pointer-events: auto !important;
        user-select: auto !important;
        touch-action: auto !important;
      }
      :-webkit-full-screen {
        overflow: auto !important;
        pointer-events: auto !important;
        user-select: auto !important;
        touch-action: auto !important;
      }
      :-moz-full-screen {
        overflow: auto !important;
        pointer-events: auto !important;
        user-select: auto !important;
        touch-action: auto !important;
      }
      :-ms-fullscreen {
        overflow: auto !important;
        pointer-events: auto !important;
        user-select: auto !important;
        touch-action: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  async function openFullscreen() {
    // Try different selectors to find the main content area
    let elem =
      document.getElementById("article") ||
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector("[data-article]") ||
      document.querySelector(".article") ||
      document.body; // Use body as last resort, not documentElement

    if (!elem) {
      console.warn("No suitable element found for fullscreen");
      return;
    }

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        // Safari
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        // IE11
        await elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        // Firefox
        await elem.mozRequestFullScreen();
      }
    } catch (error) {
      console.warn("Failed to enter fullscreen:", error);
    }
  }

  async function closeFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // Safari
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE11
        await document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        await document.mozCancelFullScreen();
      }
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error);
    }
  }

  const handleToggle = () => {
    if (isFull) {
      closeFullscreen();
    } else {
      openFullscreen();
    }
  };

  return (
    <div className="flex gap-1 flex-row-reverse">
      <Button className="cursor-pointer" variant="outline" size="icon" asChild>
        <Link href="/">
          <X />
        </Link>
      </Button>
      <Button
        onClick={handleToggle}
        className="cursor-pointer"
        variant="outline"
        size="icon"
      >
        {isFull ? <Minimize /> : <Maximize />}
      </Button>
    </div>
  );
};
