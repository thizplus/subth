"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReelsLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
  className?: string;
}

/**
 * ReelsLayout - Fullscreen Immersive Layout for Reels (TikTok Style)
 *
 * Features:
 * - No navbar, no sidebar (immersive experience)
 * - Safe area support for notch devices
 * - Floating back button
 * - Dark background for video viewing
 */
export function ReelsLayout({
  children,
  showBackButton = true,
  title = "Reels",
  className,
}: ReelsLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black text-reels-text",
        "flex justify-center",
        className
      )}
    >
      {/* Centered container - full width on mobile, max-width on desktop */}
      <div
        className="relative w-full sm:max-w-[420px] h-full bg-reels-bg flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Floating Header */}
        <header
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 reels-gradient-top pointer-events-none"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
        >
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="pointer-events-auto text-reels-text hover:bg-reels-text-subtle/20 rounded-full"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}

          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>

          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto text-reels-text hover:bg-reels-text-subtle/20 rounded-full"
          >
            <MoreVertical className="h-6 w-6" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
