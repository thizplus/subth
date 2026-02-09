"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Loader2, X, Bot } from "lucide-react";
import { useSemanticSearchStore } from "../store";
import { semanticSearchService } from "../service";
import { useDictionary } from "@/components/dictionary-provider";
import Image from "next/image";
import { CDN_URL } from "@/lib/constants";

const EXAMPLE_PROMPTS_TH = [
  "พยาบาล",
  "นักเรียน",
  "ออฟฟิศ",
  "ชุดว่ายน้ำ",
  "นวด",
  "ผมทอง",
];

const EXAMPLE_PROMPTS_EN = [
  "nurse",
  "school uniform",
  "office lady",
  "swimsuit",
  "massage",
  "blonde",
];

export function SearchModal() {
  const { locale } = useDictionary();
  const router = useRouter();
  const {
    isOpen,
    close,
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    setLoading,
    error,
    setError,
    aiMessage,
    setAiMessage,
    keywords,
    setKeywords,
  } = useSemanticSearchStore();

  const EXAMPLE_PROMPTS = locale === "th" ? EXAMPLE_PROMPTS_TH : EXAMPLE_PROMPTS_EN;

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAiMessage(null);
    setKeywords([]);

    try {
      // ใช้ RAG Chat แทน semantic search
      const response = await semanticSearchService.chat({
        message: query.trim(),
        limit: 24,
      });
      setResults(response.videos);
      setAiMessage(response.message);
      setKeywords(response.keywords || []);
    } catch (err) {
      setError(locale === "th" ? "ค้นหาไม่สำเร็จ ลองใหม่อีกครั้ง" : "Search failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, locale, setLoading, setError, setResults, setAiMessage, setKeywords]);

  const handleExampleClick = async (prompt: string) => {
    setQuery(prompt);
    setLoading(true);
    setError(null);
    setAiMessage(null);
    setKeywords([]);

    try {
      const response = await semanticSearchService.chat({
        message: prompt,
        limit: 24,
      });
      setResults(response.videos);
      setAiMessage(response.message);
      setKeywords(response.keywords || []);
    } catch (err) {
      setError(locale === "th" ? "ค้นหาไม่สำเร็จ ลองใหม่อีกครั้ง" : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoClick = (videoId: string) => {
    close();
    router.push(`${locale === "en" ? "/en" : ""}/videos/${videoId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {locale === "th" ? "ค้นหาด้วย AI" : "AI Search"}
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                locale === "th"
                  ? "พิมพ์สิ่งที่อยากดู เช่น พยาบาล, สาวผมทอง..."
                  : "Type what you want to see..."
              }
              className="pl-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Example Prompts */}
        {!results.length && !isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {locale === "th" ? "ลองค้นหา:" : "Try searching:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {locale === "th" ? "กำลังค้นหา..." : "Searching..."}
            </p>
          </div>
        )}

        {/* AI Message */}
        {!isLoading && aiMessage && (
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">{aiMessage}</p>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">
              {locale === "th"
                ? `พบ ${results.length} ผลลัพธ์`
                : `Found ${results.length} results`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {results.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                >
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail.startsWith("http") ? video.thumbnail : `${CDN_URL}${video.thumbnail}`}
                      alt={video.title || "Video thumbnail"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-xs">
                        No image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-white/70 text-xs">
                      {Math.round(video.similarity * 100)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && query && results.length === 0 && !aiMessage && (
          <p className="text-center text-muted-foreground py-8">
            {locale === "th"
              ? "ไม่พบผลลัพธ์ ลองคำอื่นดู"
              : "No results found. Try a different query."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
