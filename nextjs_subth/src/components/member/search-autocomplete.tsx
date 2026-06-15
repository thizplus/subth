"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES, cdnUrl } from "@/lib/constants";
import type { VideoListItem } from "@/features/video/types";
import { useDictionary } from "@/components/dictionary-provider";

interface SearchAutocompleteProps {
  locale: "th" | "en";
}


export function SearchAutocomplete({ locale }: SearchAutocompleteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getLocalizedPath } = useDictionary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const basePath = locale === "th" ? "" : "/en";
  const placeholder = locale === "th" ? "ค้นหา..." : "Search...";

  const searchVideos = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        limit: "8",
        page: "1",
        lang: locale,
      });
      // publicGet unwraps { success, data } → returns data directly (array of videos)
      const videos = await apiClient.publicGet<VideoListItem[]>(
        `${API_ROUTES.VIDEOS.SEARCH}?${params.toString()}`
      );

      setResults(videos || []);
      setIsOpen((videos?.length || 0) > 0);
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchVideos(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      setResults([]);
      setIsLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      router.push(`${basePath}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (video: VideoListItem) => {
    setIsOpen(false);
    setQuery("");
    router.push(getLocalizedPath(`/videos/${video.id}`));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Reset on route change
  useEffect(() => {
    setIsOpen(false);
    setResults([]);
    setIsLoading(false);
    setSelectedIndex(-1);
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const getThumbnail = (video: VideoListItem) => {
    if (!video.thumbnail) return "/placeholder-video.jpg";
    return cdnUrl(video.thumbnail);
  };

  return (
    <div ref={containerRef} className="relative flex flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="pl-9 pr-10 h-9 w-full"
          autoComplete="off"
        />
        {isLoading ? (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label={placeholder}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <ul className="py-1">
            {results.map((video, index) => (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(video)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
                    index === selectedIndex ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative w-16 h-10 shrink-0 overflow-hidden rounded">
                    <Image
                      src={getThumbnail(video)}
                      alt={video.title || ""}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <span className="text-sm line-clamp-2 flex-1">{video.title}</span>
                </button>
              </li>
            ))}
          </ul>
          {/* View all results link */}
          <Link
            href={`${basePath}/search?q=${encodeURIComponent(query)}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-1 px-3 py-2.5 text-sm text-primary hover:bg-accent border-t border-border transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            {locale === "th" ? `ดูผลลัพธ์ทั้งหมด "${query}"` : `View all results for "${query}"`}
          </Link>
        </div>
      )}
    </div>
  );
}
