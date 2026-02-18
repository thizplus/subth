"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Film, Loader2 } from "lucide-react";
import { searchVideosForMention, type VideoSearchResult } from "../service";
import { CDN_URL } from "@/lib/constants";

interface VideoMentionPickerProps {
  query: string;
  onSelect: (video: VideoSearchResult) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function VideoMentionPicker({
  query,
  onSelect,
  onClose,
  position,
}: VideoMentionPickerProps) {
  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search videos when query changes
  useEffect(() => {
    const searchVideos = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const videos = await searchVideosForMention(query);
        setResults(videos);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchVideos, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (query.length < 2) {
    return (
      <div
        ref={containerRef}
        className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg p-3 text-center text-sm text-muted-foreground"
      >
        <Film className="h-4 w-4 inline mr-1" />
        พิมพ์รหัสหนังอย่างน้อย 2 ตัวอักษร
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-[200px] overflow-y-auto"
      style={position}
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="p-3 text-center text-sm text-muted-foreground">
          ไม่พบหนังที่ตรงกับ "{query}"
        </div>
      ) : (
        <div className="py-1">
          {results.map((video, index) => (
            <button
              key={video.id}
              onClick={() => onSelect(video)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
                index === selectedIndex ? "bg-accent" : ""
              }`}
            >
              <img
                src={`${CDN_URL}/${video.thumbnail}`}
                alt={video.title}
                className="h-10 w-14 rounded object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {video.titleTh || video.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
