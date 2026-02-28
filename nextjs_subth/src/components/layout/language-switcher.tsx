"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useDictionary } from "@/components/dictionary-provider";

const LANGUAGES = [
  { code: "th", label: "TH", prefix: "" },
  { code: "en", label: "EN", prefix: "/en" },
] as const;

export function LanguageSwitcher() {
  const { locale } = useDictionary();
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const switchLocale = (targetLang: (typeof LANGUAGES)[number]) => {
    if (targetLang.code === locale) return;

    // ลบ prefix ภาษาปัจจุบันออกก่อน
    let cleanPath = pathname;
    for (const lang of LANGUAGES) {
      if (lang.prefix && pathname.startsWith(lang.prefix)) {
        cleanPath = pathname.slice(lang.prefix.length) || "/";
        break;
      }
    }

    // เพิ่ม prefix ภาษาใหม่
    const newPath = targetLang.prefix + cleanPath;
    router.push(newPath || "/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLang.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLocale(lang)}
            className="cursor-pointer gap-2"
          >
            <span className="font-medium">{lang.label}</span>
            {locale === lang.code && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
