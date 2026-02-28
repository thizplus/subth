"use client";

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PublicSidebar } from "./public-sidebar";
import { PublicLanguageSwitcher } from "./public-language-switcher";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { LogIn, Play } from "lucide-react";
import Link from "next/link";
import { ChatProvider, ChatFab } from "@/features/community-chat";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useDictionary } from "@/components/dictionary-provider";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface PublicLayoutClientProps {
  children: ReactNode;
}

/**
 * PublicLayoutClient - Client Component
 * ใช้ useDictionary() แทน locale prop
 */
export function PublicLayoutClient({ children }: PublicLayoutClientProps) {
  const { locale, dictionary } = useDictionary();
  const t = dictionary.common;
  const { isAuthenticated } = useAuthStore();
  const scrollDirection = useScrollDirection();

  return (
    <ChatProvider locale={locale as "th" | "en"}>
      <SidebarProvider>
        <PublicSidebar locale={locale as "th" | "en"} />
        <SidebarInset className="w-0 min-w-0">
          {/* Smart Header - ซ่อนเมื่อ scroll ลง, แสดงเมื่อ scroll ขึ้น */}
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

              {/* Login CTA หรือ Watch Videos CTA (ชิดซ้าย) */}
              {!isAuthenticated ? (
                <LoginDialog locale={locale as "th" | "en"}>
                  <button className="flex items-center gap-2 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/50 animate-[pulse_2s_ease-in-out_infinite]">
                      <LogIn className="h-4 w-4" />
                    </div>
                    <div className="grid leading-tight">
                      <span className="text-sm font-medium">{t.login}</span>
                      <span className="text-[10px] text-muted-foreground">{t.loginToWatch}</span>
                    </div>
                  </button>
                </LoginDialog>
              ) : (
                <Link href={`${locale === "en" ? "/en" : ""}/member`} className="flex items-center gap-2 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/50 animate-[pulse_2s_ease-in-out_infinite]">
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="grid leading-tight">
                    <span className="text-sm font-medium">{t.allVideos}</span>
                    <span className="text-[10px] text-muted-foreground">{t.videoTypes}</span>
                  </div>
                </Link>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Language Switcher */}
              <PublicLanguageSwitcher locale={locale as "th" | "en"} />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-0 py-4 sm:px-4">
            {children}
          </main>

          {/* Scroll to Top */}
          <ScrollToTop />

          {/* Chat FAB */}
          <ChatFab />
        </SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}
