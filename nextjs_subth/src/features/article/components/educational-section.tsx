interface EducationalSectionProps {
  // Educational Context
  thematicExplanation?: string;
  culturalContext?: string;
  genreInsights?: string[];
  // Comparative Analysis
  studioComparison?: string;
  actorEvolution?: string;
  genreRanking?: string;
}

export function EducationalSection({
  thematicExplanation,
  culturalContext,
  genreInsights,
  studioComparison,
  actorEvolution,
  genreRanking,
}: EducationalSectionProps) {
  const hasEducational = thematicExplanation || culturalContext || (genreInsights && genreInsights.length > 0);
  const hasComparative = studioComparison || actorEvolution || genreRanking;

  if (!hasEducational && !hasComparative) {
    return null;
  }

  return (
    <section className="mt-8 space-y-8">
      {/* Educational Context */}
      {hasEducational && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span>📚</span>
            <span>บริบทเชิงลึก</span>
          </h2>

          {/* Genre Insights */}
          {genreInsights && genreInsights.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {genreInsights.map((insight, i) => (
                <span
                  key={i}
                  className="rounded-lg border bg-muted/30 px-3 py-1.5 text-sm"
                >
                  {insight}
                </span>
              ))}
            </div>
          )}

          {/* Thematic Explanation */}
          {thematicExplanation && (
            <div className="mb-4 space-y-4 leading-relaxed text-muted-foreground">
              {thematicExplanation.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Cultural Context */}
          {culturalContext && (
            <div className="rounded-lg border-l-4 border-primary/50 bg-muted/20 p-4">
              <h3 className="mb-2 text-sm font-medium">บริบทวัฒนธรรมญี่ปุ่น</h3>
              <p className="text-sm text-muted-foreground">{culturalContext}</p>
            </div>
          )}
        </div>
      )}

      {/* Comparative Analysis */}
      {hasComparative && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span>⚖️</span>
            <span>การเปรียบเทียบ</span>
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Studio Comparison */}
            {studioComparison && (
              <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-transparent p-4">
                <h3 className="mb-2 font-medium">เปรียบเทียบกับค่าย</h3>
                <p className="text-sm text-muted-foreground">{studioComparison}</p>
              </div>
            )}

            {/* Actor Evolution */}
            {actorEvolution && (
              <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-transparent p-4">
                <h3 className="mb-2 font-medium">พัฒนาการนักแสดง</h3>
                <p className="text-sm text-muted-foreground">{actorEvolution}</p>
              </div>
            )}
          </div>

          {/* Genre Ranking */}
          {genreRanking && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-2 font-medium text-primary">ตำแหน่งในแนวเรื่อง</h3>
              <p className="text-sm">{genreRanking}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
