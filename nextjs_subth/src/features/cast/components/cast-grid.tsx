import { CastCard } from "./cast-card";
import type { Cast } from "../types";

interface CastGridProps {
  casts: Cast[];
  locale?: string;
}

export function CastGrid({ casts, locale }: CastGridProps) {
  if (!casts || casts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No casts found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {casts.map((cast) => (
        <CastCard key={cast.id} cast={cast} locale={locale} />
      ))}
    </div>
  );
}
