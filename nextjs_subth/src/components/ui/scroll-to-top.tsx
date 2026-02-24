"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed z-40 flex h-10 w-10 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "transition-all duration-300 hover:scale-110 hover:shadow-xl",
        "active:scale-95",
        // Position: above FAB chat (h-10 + gap-2 + bottom-4 = bottom-16)
        "bottom-16 right-4 md:bottom-20 md:right-6",
        // Animation
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
      aria-label="กลับขึ้นด้านบน"
    >
      <ArrowUp size={20} />
    </button>
  );
}
