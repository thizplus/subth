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
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/5 px-3 py-1.5 text-xs">
      <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
      <span className="text-muted-foreground">
        {locale === "en" ? (
          <>
            Verified by{" "}
            <Link
              href={authorPath}
              className="font-medium text-success hover:underline"
            >
              SubTH Editorial
            </Link>
            {" · "}
            {formattedDate}
            <span className="text-success/50"> • </span>
            <span className="text-success">Malware-Free</span>
          </>
        ) : (
          <>
            ตรวจสอบโดย{" "}
            <Link
              href={authorPath}
              className="font-medium text-success hover:underline"
            >
              SubTH Editorial
            </Link>
            {" · "}
            {formattedDate}
            <span className="text-success/50"> • </span>
            <span className="text-success">ปลอดมัลแวร์</span>
          </>
        )}
      </span>
    </div>
  );
}
