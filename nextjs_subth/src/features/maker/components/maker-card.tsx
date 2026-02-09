import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { Maker } from "../types";

interface MakerCardProps {
  maker: Maker;
  locale?: string;
}

export function MakerCard({ maker, locale = "th" }: MakerCardProps) {
  const basePath = locale === "en" ? "/en/member" : "/member";
  return (
    <Link href={`${basePath}/makers/${maker.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{maker.name}</h3>
            {maker.videoCount !== undefined && (
              <p className="text-sm text-muted-foreground">
                {maker.videoCount} videos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
