"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface ProsConsProps {
  strengths: string[];
  weaknesses: string[];
  className?: string;
}

export function ProsCons({ strengths, weaknesses, className }: ProsConsProps) {
  const { t } = useDictionary();

  if (!strengths?.length && !weaknesses?.length) return null;

  return (
    <div className={cn("grid md:grid-cols-2 gap-4 my-6", className)}>
      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {t("article.strengths")}
          </h4>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 dark:text-green-200">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
            <X className="h-4 w-4" />
            {t("article.weaknesses")}
          </h4>
          <ul className="space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-200">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
