"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { LoginDialog } from "@/features/auth";
import type { ReelItem } from "../types";

interface ReelCardProps {
  item: ReelItem;
  locale?: "th" | "en";
}

/**
 * ReelCard displays a single reel item with thumbnail
 * Shows a play button overlay and login CTA
 */
export function ReelCard({ item, locale = "th" }: ReelCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail with play overlay */}
      <div className="relative aspect-[9/16] w-full bg-muted">
        {item.thumbUrl ? (
          <>
            <Image
              src={item.thumbUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <LoginDialog locale={locale}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-white/90 hover:bg-white"
                >
                  <Play className="h-8 w-8 text-black" />
                </Button>
              </LoginDialog>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Preview
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="mb-2 line-clamp-1 text-sm font-medium">{item.title}</h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
