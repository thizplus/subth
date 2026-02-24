import { Settings2, Clock, Film, Volume2, Subtitles, Languages } from "lucide-react";
import { formatDuration } from "../utils";

interface TechnicalSpecsProps {
  videoQuality?: string;
  audioQuality?: string;
  subtitleQuality?: string;
  translationMethod?: string;
  translationNote?: string;
  duration: string;
  readingTime?: number;
}

export function TechnicalSpecs({
  videoQuality,
  audioQuality,
  subtitleQuality,
  translationMethod,
  translationNote,
  duration,
  readingTime,
}: TechnicalSpecsProps) {
  const specs = [
    {
      icon: Film,
      label: "ความละเอียด",
      value: videoQuality,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Volume2,
      label: "คุณภาพเสียง",
      value: audioQuality,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: Subtitles,
      label: "คุณภาพซับ",
      value: subtitleQuality,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Clock,
      label: "ความยาว",
      value: formatDuration(duration),
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ].filter((spec) => spec.value);

  if (!specs.length && !translationMethod) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Settings2 className="h-5 w-5" />
        ข้อมูลเทคนิค
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-4 text-center"
          >
            <div className={`rounded-full p-2.5 ${spec.bg}`}>
              <spec.icon className={`h-5 w-5 ${spec.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{spec.label}</p>
              <p className="font-semibold">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>

      {translationMethod && (
        <div className="flex items-start gap-3 rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-4">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Languages className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">วิธีการแปล</p>
            <p className="font-medium">{translationMethod}</p>
            {translationNote && (
              <p className="mt-1 text-sm text-muted-foreground">
                {translationNote}
              </p>
            )}
          </div>
        </div>
      )}

      {readingTime && (
        <p className="text-center text-xs text-muted-foreground">
          เวลาอ่านโดยประมาณ {readingTime} นาที
        </p>
      )}
    </section>
  );
}
