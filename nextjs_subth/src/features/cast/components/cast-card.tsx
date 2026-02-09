import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Cast } from "../types";

interface CastCardProps {
  cast: Cast;
  locale?: string;
}

export function CastCard({ cast, locale = "th" }: CastCardProps) {
  const basePath = locale === "en" ? "/en/member" : "/member";
  return (
    <Link href={`${basePath}/casts/${cast.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
          {cast.name.charAt(0).toUpperCase()}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium truncate">{cast.name}</h3>
          <p className="text-sm text-muted-foreground">
            {cast.videoCount} videos
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
