"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  onThemeChange,
}: {
  className: React.HtmlHTMLAttributes<HTMLDivElement>["className"];
  onThemeChange?: (theme: string) => void;
}) {
  const { setTheme, theme } = useTheme();

  const toggler = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
    if (onThemeChange) {
      onThemeChange(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <div
      className={cn("flex justify-center items-center rounded-md", className)}
    >
      {theme === "light" ? (
        <Button onClick={toggler} variant="link" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        </Button>
      ) : (
        <Button onClick={toggler} variant="link" size="icon">
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      )}
    </div>
  );
}
