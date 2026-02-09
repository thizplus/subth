"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelVideoPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  isAdjacent?: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onDoubleTap?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

/**
 * ReelVideoPlayer - Video Player for Reels
 *
 * Features:
 * - Auto-play when active
 * - Mute/unmute
 * - Double-tap to like
 * - Progress tracking
 * - Tap to play/pause
 */
export function ReelVideoPlayer({
  src,
  poster,
  isActive,
  isAdjacent = false,
  isMuted,
  onMuteToggle,
  onDoubleTap,
  onProgress,
  className,
}: ReelVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        // Auto-play blocked, user needs to interact
        setIsPlaying(false);
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  // Update muted state
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  // Progress tracking (throttled to reduce re-renders)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    let lastUpdate = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      // Throttle to max 10 updates per second
      if (now - lastUpdate < 100) return;
      lastUpdate = now;

      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onProgress]);

  // Handle tap (single tap = play/pause, double tap = like)
  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 250) {
      // Double tap - like
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      onDoubleTap?.();
    } else {
      // Single tap - wait to see if it's a double tap
      tapTimeoutRef.current = setTimeout(() => {
        // Single tap confirmed - toggle play/pause
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
        setShowControls(true);
        setTimeout(() => setShowControls(false), 1000);
      }, 250);
    }

    lastTapRef.current = now;
  }, [onDoubleTap]);

  // Handle play/pause state
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Loop video
  const handleEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-black",
        className
      )}
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={isActive || isAdjacent ? src : undefined}
        poster={poster}
        className="h-full w-full object-contain"
        playsInline
        loop
        muted={isMuted}
        preload={isActive ? "auto" : isAdjacent ? "metadata" : "none"}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />

      {/* Play/Pause indicator (shows briefly on tap) */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4">
            {isPlaying ? (
              <Pause className="h-12 w-12 text-white" />
            ) : (
              <Play className="h-12 w-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMuteToggle();
        }}
        className="absolute bottom-20 right-4 z-30 bg-black/50 rounded-full p-2"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </button>
    </div>
  );
}
