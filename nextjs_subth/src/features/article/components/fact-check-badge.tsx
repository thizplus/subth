import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface FactCheckBadgeProps {
  updatedAt: string;
  locale?: "th" | "en";
}

export function FactCheckBadge({
  updatedAt,
  locale = "th",
}: FactCheckBadgeProps) {
  const authorPath = locale === "en" ? "/en/author/subth-editorial" : "/author/subth-editorial";
  const dateLocale = locale === "en" ? "en-US" : "th-TH";

  const formattedDate = new Date(updatedAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-sm">
      <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
      <span className="text-muted-foreground">
        {locale === "en" ? (
          <>
            Fact-checked by{" "}
            <Link
              href={authorPath}
              className="font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              SubTH Editorial Team
            </Link>
            {" "}&middot; {formattedDate}
          </>
        ) : (
          <>
            ตรวจสอบข้อมูลโดย{" "}
            <Link
              href={authorPath}
              className="font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              ทีมบรรณาธิการ SubTH
            </Link>
            {" "}&middot; {formattedDate}
          </>
        )}
      </span>
    </div>
  );
}
