"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X, Bot } from "lucide-react";
import { semanticSearchService } from "@/features/semantic-search/service";
import type { SemanticSearchResult } from "@/features/semantic-search/types";
import { VirtuosoGrid } from "react-virtuoso";
import Image from "next/image";
import Link from "next/link";

// Typing effect hook
function useTypingEffect(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
}

const EXAMPLE_PROMPTS = [
  "nurse",
  "student",
  "office lady",
  "swimsuit",
  "massage",
  "blonde",
  "glasses",
  "maid",
];

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "https://files.subth.com";

// Video Card for Virtual Grid - use memo to prevent re-render
const VideoItem = React.memo(function VideoItem({ video }: { video: SemanticSearchResult }) {
  const thumbnailUrl = video.thumbnail?.startsWith("http")
    ? video.thumbnail
    : video.thumbnail
    ? `${CDN_URL}${video.thumbnail}`
    : "/placeholder-video.jpg";

  return (
    <Link href={`/en/member/videos/${video.id}`} className="block">
      <div className="overflow-hidden rounded-lg bg-muted">
        <div className="relative aspect-video">
          <Image
            src={thumbnailUrl}
            alt={video.title || "Video"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
            loading="lazy"
            placeholder="empty"
          />
        </div>
      </div>
      {/* Fixed height for title area - 2 lines */}
      <div className="pt-2 h-12">
        <p className="font-medium line-clamp-2 text-sm" title={video.title}>
          {video.title}
        </p>
      </div>
    </Link>
  );
});

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Store query for load more
  const searchQueryRef = useRef<string>("");

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Scroll to top when starting new search
    window.scrollTo({ top: 0, behavior: "smooth" });

    setIsLoading(true);
    setError(null);
    setAiMessage(null);
    setKeywords([]);
    setHasSearched(true);
    setResults([]);
    setNextCursor(null);
    searchQueryRef.current = searchQuery.trim();

    try {
      const response = await semanticSearchService.chat({
        message: searchQuery.trim(),
        limit: 24,
      });
      setResults(response.videos);
      setAiMessage(response.message);
      setKeywords(response.keywords || []);
      setNextCursor(response.nextCursor || null);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore || !searchQueryRef.current) return;

    setIsLoadingMore(true);
    try {
      const response = await semanticSearchService.chat({
        message: searchQueryRef.current,
        limit: 24,
        cursor: nextCursor,
      });
      setResults((prev) => [...prev, ...response.videos]);
      setNextCursor(response.nextCursor || null);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleExampleClick = (prompt: string) => {
    setQuery(prompt);
    handleSearch(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch(query);
    }
  };

  // Typing effect for AI message
  const { displayedText, isTyping } = useTypingEffect(aiMessage || "", 25);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          {/* Centered Search Section */}
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold leading-tight">Smart Mode</h1>
                <p className="text-sm text-muted-foreground">What are you in the mood for?</p>
              </div>
            </div>

            {/* Search Input - Border Bottom Only with Debounce */}
            <div className="relative w-full">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you in the mood for..."
                className="w-full pl-8 pr-10 py-3 text-lg bg-transparent border-b-2 border-muted-foreground/30 focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                autoFocus
              />
              {query && !isLoading && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Example Prompts */}
        {!hasSearched && !isLoading && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Bot className="h-12 w-12 text-primary" />
              <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 text-primary-foreground" />
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Hey there!</h2>
            <p className="text-muted-foreground mb-8">
              Just tell me what you're looking for<br />
              and I'll hook you up!
            </p>
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Give these a try:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(prompt)}
                    disabled={isLoading}
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading - Chat Bubble Style */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-2xl mx-auto">
            <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-0 top-3 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-primary/10" />
              <div className="bg-primary/10 rounded-2xl rounded-tl-sm p-4">
                <p className="text-lg">
                  Hang on, I'm looking for you
                  <Loader2 className="inline-block h-4 w-4 animate-spin text-primary ml-2" />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <div className="space-y-6">
            {/* AI Message with Typing Effect - Chat Bubble Style */}
            {aiMessage && (
              <div className="max-w-2xl mx-auto space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="relative flex-1">
                    {/* Chat bubble arrow */}
                    <div className="absolute left-0 top-3 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-primary/10" />
                    <div className="bg-primary/10 rounded-2xl rounded-tl-sm p-4">
                      <p className="font-medium">
                        {displayedText}
                        {isTyping && <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Keywords - show outside bubble */}
                {!isTyping && keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-13">
                    <span className="text-xs text-muted-foreground">Searched:</span>
                    {keywords.map((keyword) => (
                      <span key={keyword} className="text-xs text-primary">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            {results.length > 0 && (
              <p className="text-muted-foreground text-sm">
                Found {results.length} results
                {nextCursor && " • Scroll down for more"}
              </p>
            )}

            {/* Virtual Video Grid with Window Scroll */}
            {results.length > 0 ? (
              <>
                <VirtuosoGrid
                  useWindowScroll
                  totalCount={results.length}
                  overscan={400}
                  increaseViewportBy={400}
                  listClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                  itemContent={(index) => (
                    <VideoItem video={results[index]} />
                  )}
                  endReached={() => {
                    if (nextCursor && !isLoadingMore) {
                      handleLoadMore();
                    }
                  }}
                />
                {/* Footer */}
                {isLoadingMore ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Finding more for you, please wait...</p>
                  </div>
                ) : nextCursor ? (
                  <div className="flex justify-center py-4">
                    <span className="text-muted-foreground text-sm">
                      Scroll down to load more
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <span className="text-muted-foreground text-sm">
                      All results shown
                    </span>
                  </div>
                )}
              </>
            ) : (
              !isLoading &&
              hasSearched &&
              !error && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No results found. Try a different query.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
