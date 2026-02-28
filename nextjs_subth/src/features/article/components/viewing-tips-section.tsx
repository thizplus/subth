"use client";

import { useDictionary } from "@/components/dictionary-provider";

interface ViewingTipsSectionProps {
  viewingTips?: string;
  bestMoments?: string[];
  audienceMatch?: string;
  replayValue?: string;
}

export function ViewingTipsSection({
  viewingTips,
  bestMoments,
  audienceMatch,
  replayValue,
}: ViewingTipsSectionProps) {
  const { t } = useDictionary();

  if (!viewingTips && (!bestMoments || bestMoments.length === 0) && !audienceMatch && !replayValue) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span>👁️</span>
        <span>{t("article.viewingTips")}</span>
      </h2>

      {/* Viewing Tips Content */}
      {viewingTips && (
        <div className="mb-6 space-y-4 leading-relaxed text-muted-foreground">
          {viewingTips.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* Best Moments */}
      {bestMoments && bestMoments.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-medium">{t("article.bestMoments")}</h3>
          <ul className="space-y-2">
            {bestMoments.map((moment, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{moment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audience Match & Replay Value */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Audience Match */}
        {audienceMatch && (
          <div className="rounded-lg border bg-gradient-to-br from-success/5 to-transparent p-4">
            <h3 className="mb-2 font-medium text-success">
              {t("article.audienceMatch")}
            </h3>
            <p className="text-sm text-muted-foreground">{audienceMatch}</p>
          </div>
        )}

        {/* Replay Value */}
        {replayValue && (
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
            <h3 className="mb-2 font-medium text-primary">
              {t("article.replayValue")}
            </h3>
            <p className="text-sm text-muted-foreground">{replayValue}</p>
          </div>
        )}
      </div>
    </section>
  );
}
