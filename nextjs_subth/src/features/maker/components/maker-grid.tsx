import { MakerCard } from "./maker-card";
import type { Maker } from "../types";

interface MakerGridProps {
  makers: Maker[];
  locale?: string;
}

export function MakerGrid({ makers, locale }: MakerGridProps) {
  if (!makers || makers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No makers found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {makers.map((maker) => (
        <MakerCard key={maker.id} maker={maker} locale={locale} />
      ))}
    </div>
  );
}
