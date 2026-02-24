import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface TrustBadgeProps {
  updatedAt: string;
  locale?: "th" | "en";
}

/**
 * TrustBadge - รวม FactCheck + Safety Badge
 * แสดงว่าเนื้อหาผ่านการตรวจสอบและปลอดภัย
 */
export function TrustBadge({ updatedAt, locale = "th" }: TrustBadgeProps) {
  const authorPath =
    locale === "en" ? "/en/author/subth-editorial" : "/author/subth-editorial";
  const dateLocale = locale === "en" ? "en-US" : "th-TH";

  const formattedDate = new Date(updatedAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-xs">
      <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
      <span className="text-muted-foreground">
        {locale === "en" ? (
          <>
            Verified by{" "}
            <Link
              href={authorPath}
              className="font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              SubTH
            </Link>
            {" · "}
            {formattedDate}
            <span className="text-green-600/50 dark:text-green-400/50">
              {" "}
              •{" "}
            </span>
            <span className="text-green-700 dark:text-green-300">
              Malware-Free
            </span>
          </>
        ) : (
          <>
            ตรวจสอบโดย{" "}
            <Link
              href={authorPath}
              className="font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              SubTH
            </Link>
            {" · "}
            {formattedDate}
            <span className="text-green-600/50 dark:text-green-400/50">
              {" "}
              •{" "}
            </span>
            <span className="text-green-700 dark:text-green-300">
              ปลอดมัลแวร์
            </span>
          </>
        )}
      </span>
    </div>
  );
}
