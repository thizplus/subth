"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/layout";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { SearchAutocomplete } from "./search-autocomplete";

interface MemberHeaderProps {
  locale: "th" | "en";
}

export function MemberHeader({ locale }: MemberHeaderProps) {
  const scrollDirection = useScrollDirection();

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background transition-all duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        {/* Search Autocomplete */}
        <SearchAutocomplete locale={locale} />

        {/* Language Switcher - ขวาสุด */}
        <div className="shrink-0 ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
