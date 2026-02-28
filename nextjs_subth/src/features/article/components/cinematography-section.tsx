"use client";

import { useDictionary } from "@/components/dictionary-provider";

interface CinematographySectionProps {
  cinematographyAnalysis?: string;
  visualStyle?: string;
  atmosphereNotes?: string[];
}

export function CinematographySection({
  cinematographyAnalysis,
  visualStyle,
  atmosphereNotes,
}: CinematographySectionProps) {
  const { t } = useDictionary();

  if (!cinematographyAnalysis && !visualStyle && (!atmosphereNotes || atmosphereNotes.length === 0)) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span>🎬</span>
        <span>{t("article.cinematography")}</span>
      </h2>

      {/* Visual Style Badge */}
      {visualStyle && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm font-medium text-primary">
            {t("article.visualStyle")}: <span className="font-normal text-foreground">{visualStyle}</span>
          </p>
        </div>
      )}

      {/* Atmosphere Notes */}
      {atmosphereNotes && atmosphereNotes.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {atmosphereNotes.map((note, i) => (
            <span
              key={i}
              className="rounded-full border bg-muted/50 px-3 py-1 text-sm"
            >
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Cinematography Analysis Content */}
      {cinematographyAnalysis && (
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {cinematographyAnalysis.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </section>
  );
}
