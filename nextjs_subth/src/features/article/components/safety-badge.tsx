"use client";

import { ShieldCheck } from "lucide-react";

interface SafetyBadgeProps {
  locale?: "th" | "en";
}

const translations = {
  th: {
    verified: "เนื้อหาผ่านการตรวจสอบ",
    noMalware: "ปลอดมัลแวร์",
  },
  en: {
    verified: "Verified Content",
    noMalware: "Malware-Free",
  },
};

export function SafetyBadge({ locale = "th" }: SafetyBadgeProps) {
  const t = translations[locale];

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>{t.verified}</span>
      <span className="text-green-500 dark:text-green-500">•</span>
      <span>{t.noMalware}</span>
    </div>
  );
}
