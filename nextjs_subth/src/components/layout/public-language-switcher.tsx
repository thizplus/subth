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
import { useArticleTranslations } from "@/components/article-translations-provider";

const LANGUAGES = [
  { code: "th", label: "TH", prefix: "" },
  { code: "en", label: "EN", prefix: "/en" },
] as const;

interface PublicLanguageSwitcherProps {
  locale: "th" | "en";
}

/**
 * Language switcher for public pages
 * - ถ้ามี ArticleTranslationsProvider จะใช้ translations สำหรับ smooth navigation
 * - ถ้าไม่มี จะใช้ path-based switching ปกติ
 */
export function PublicLanguageSwitcher({ locale }: PublicLanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { translations, articleType } = useArticleTranslations();

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const switchLocale = (targetLang: (typeof LANGUAGES)[number]) => {
    if (targetLang.code === locale) return;

    // ถ้ามี translations จาก article → ใช้ slug ตรงๆ (smooth navigation)
    if (translations && translations[targetLang.code] && articleType) {
      const targetSlug = translations[targetLang.code];
      const basePath = targetLang.prefix + `/articles/${articleType}/${targetSlug}`;
      router.push(basePath);
      return;
    }

    // Fallback: path-based switching
    let cleanPath = pathname;
    for (const lang of LANGUAGES) {
      if (lang.prefix && pathname.startsWith(lang.prefix)) {
        cleanPath = pathname.slice(lang.prefix.length) || "/";
        break;
      }
    }

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
