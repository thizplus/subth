"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/layout";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface MemberHeaderProps {
  locale: "th" | "en";
}

export function MemberHeader({ locale }: MemberHeaderProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const basePath = locale === "th" ? "/member" : "/en/member";
  const searchPlaceholder = locale === "th" ? "ค้นหา..." : "Search...";
  const scrollDirection = useScrollDirection();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`${basePath}/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

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

        {/* Search - แสดงทุกขนาดหน้าจอ */}
        <form onSubmit={handleSearch} className="relative flex flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            className="pl-9 pr-10 h-9 w-full"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label={searchPlaceholder}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Language Switcher */}
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
