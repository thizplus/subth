"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { formatTimestamp } from "../utils";
import type { TopQuote } from "../types";

interface QuoteCardProps {
  quotes: TopQuote[];
  videoId: string;
  locale?: "th" | "en";
}

export function QuoteCard({ quotes, videoId, locale = "th" }: QuoteCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (!quotes?.length) {
    return null;
  }

  const handleQuoteClick = (timestamp: number) => {
    if (isAuthenticated) {
      const videoPath = locale === "en"
        ? `/en/member/videos/${videoId}?t=${timestamp}`
        : `/member/videos/${videoId}?t=${timestamp}`;
      router.push(videoPath);
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Quote className="h-5 w-5 text-primary" />
        {locale === "th" ? "ประโยคเด็ด" : "Top Quotes"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {quotes.slice(0, 4).map((quote, index) => (
          <button
            key={index}
            onClick={() => handleQuoteClick(quote.timestamp)}
            className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            {/* Large quote mark background */}
            <Quote className="absolute -right-2 -top-2 h-16 w-16 rotate-12 text-primary/5 transition-transform group-hover:scale-110" />

            <blockquote className="relative mb-3 leading-relaxed">
              <span className="text-lg font-serif text-primary">&ldquo;</span>
              {quote.text}
              <span className="text-lg font-serif text-primary">&rdquo;</span>
            </blockquote>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {formatTimestamp(quote.timestamp)}
              </Badge>
              {quote.emotion && (
                <Badge className="border-0 bg-primary/10 text-xs text-primary hover:bg-primary/20">
                  {quote.emotion}
                </Badge>
              )}
            </div>

            {quote.context && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {quote.context}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Login Dialog - controlled */}
      <LoginDialog locale={locale} open={dialogOpen} onOpenChange={setDialogOpen}>
        <span className="hidden" />
      </LoginDialog>
    </section>
  );
}
