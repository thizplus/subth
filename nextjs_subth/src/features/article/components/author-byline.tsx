import Link from "next/link";
import { User, Calendar, RefreshCw } from "lucide-react";

interface AuthorBylineProps {
  publishedAt: string;
  updatedAt?: string;
  locale?: "th" | "en";
}

export function AuthorByline({
  publishedAt,
  updatedAt,
  locale = "th",
}: AuthorBylineProps) {
  const authorPath = locale === "en" ? "/en/author/subth-editorial" : "/author/subth-editorial";
  const authorName = "SubTH Editorial";

  const dateLocale = locale === "en" ? "en-US" : "th-TH";
  const publishedDate = new Date(publishedAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const updatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Check if updated date is different from published date
  const showUpdated = updatedDate && updatedDate !== publishedDate;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      {/* Author */}
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4" />
        <span>
          {locale === "en" ? "Written by" : "เขียนโดย"}{" "}
          <Link
            href={authorPath}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {authorName}
          </Link>
        </span>
      </div>

      {/* Published Date */}
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        <span>{publishedDate}</span>
      </div>

      {/* Updated Date (if different from published) */}
      {showUpdated && (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>
            {locale === "en" ? "Updated" : "อัพเดท"}: {updatedDate}
          </span>
        </div>
      )}
    </div>
  );
}
