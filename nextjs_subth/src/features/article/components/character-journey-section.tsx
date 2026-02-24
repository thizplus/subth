import { EmotionalArcPoint } from "../types";

interface CharacterJourneySectionProps {
  characterJourney?: string;
  emotionalArc?: EmotionalArcPoint[];
}

export function CharacterJourneySection({
  characterJourney,
  emotionalArc,
}: CharacterJourneySectionProps) {
  if (!characterJourney && (!emotionalArc || emotionalArc.length === 0)) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span>🎭</span>
        <span>พัฒนาการตัวละคร</span>
      </h2>

      {/* Emotional Arc Timeline */}
      {emotionalArc && emotionalArc.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {emotionalArc.map((point, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5 text-sm"
            >
              <span className="font-medium text-primary">{point.phase}</span>
              <span className="text-muted-foreground">→</span>
              <span>{point.emotion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Character Journey Content */}
      {characterJourney && (
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {characterJourney.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* Emotional Arc Details */}
      {emotionalArc && emotionalArc.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {emotionalArc.map((point, i) => (
            <div
              key={i}
              className="rounded-lg border bg-gradient-to-br from-muted/20 to-transparent p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{point.phase}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {point.emotion}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
