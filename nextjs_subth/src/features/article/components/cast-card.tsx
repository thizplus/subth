import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CastProfile } from "../types";

interface CastCardProps {
  casts: CastProfile[];
}

export function CastCard({ casts }: CastCardProps) {
  if (!casts?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <User className="h-4 w-4" />
        นักแสดง
      </p>

      <div className="flex flex-wrap gap-2">
        {casts.map((cast) => (
          <Link
            key={cast.id}
            href={cast.profileUrl}
            className="group flex items-center gap-2 rounded-full border bg-background py-1.5 pl-1.5 pr-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <Avatar className="h-8 w-8">
              {cast.imageUrl && (
                <AvatarImage src={cast.imageUrl} alt={cast.name} />
              )}
              <AvatarFallback className="text-xs">
                {cast.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary">
                {cast.name}
              </p>
              {cast.nameTH && (
                <p className="text-xs text-muted-foreground">{cast.nameTH}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
