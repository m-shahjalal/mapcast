import { useEffect, useRef } from "react";

interface SwipeOptions {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  threshold?: number;
  velocity?: number;
  disabled?: boolean;
}

export const useSwipeGesture = ({
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3,
  disabled = false,
}: SwipeOptions) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    let startY = 0;
    let startTime = 0;
    const element = ref.current;

    const handleStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleMove = (e: TouchEvent) => {
      const diff = startY - e.touches[0].clientY;
      if (diff > 10) e.preventDefault(); // Prevent scroll on upward swipe
    };

    const handleEnd = (e: TouchEvent) => {
      const distance = startY - e.changedTouches[0].clientY;
      const currentVelocity = Math.abs(distance) / (Date.now() - startTime);

      if (Math.abs(distance) > threshold && currentVelocity > velocity) {
        distance > 0 ? onSwipeUp() : onSwipeDown();
      }
    };

    element.addEventListener("touchstart", handleStart, { passive: true });
    element.addEventListener("touchmove", handleMove, { passive: false });
    element.addEventListener("touchend", handleEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleStart);
      element.removeEventListener("touchmove", handleMove);
      element.removeEventListener("touchend", handleEnd);
    };
  }, [onSwipeUp, onSwipeDown, threshold, velocity, disabled]);

  return ref;
};
