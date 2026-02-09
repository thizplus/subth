"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/features/auth";
import type { FeedItem } from "../types";

interface FeedCardProps {
  item: FeedItem;
  locale?: "th" | "en";
}

/**
 * FeedCard displays a single feed item with cover image, title, and tags
 * Shows a CTA button to login for full content
 */
export function FeedCard({ item, locale = "th" }: FeedCardProps) {
  const buttonText = locale === "th" ? "เข้าสู่ระบบเพื่อดู" : "Login to watch";
  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-video w-full bg-muted">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{item.title}</h3>

        {/* Description (if any) */}
        {item.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {item.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {item.tags.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 5}
            </Badge>
          )}
        </div>

        {/* CTA Button - เปิด LoginDialog */}
        <LoginDialog locale={locale}>
          <Button variant="default" className="w-full">
            {buttonText}
          </Button>
        </LoginDialog>
      </CardContent>
    </Card>
  );
}
