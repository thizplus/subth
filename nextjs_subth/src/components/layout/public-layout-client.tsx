"use client";

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PublicSidebar } from "./public-sidebar";
import { PublicLanguageSwitcher } from "./public-language-switcher";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyStats } from "@/features/user-stats";
import { Progress } from "@/components/ui/progress";
import { ChatProvider, ChatTicker, ChatFab } from "@/features/community-chat";
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
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: stats } = useMyStats();
  const scrollDirection = useScrollDirection();

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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

              {/* Login CTA (ชิดซ้าย) หรือ Spacer ถ้า login แล้ว */}
              {!isAuthenticated ? (
                <LoginDialog locale={locale as "th" | "en"}>
                  <button className="flex items-center gap-2 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground animate-bounce">
                      <LogIn className="h-4 w-4" />
                    </div>
                    <div className="grid leading-tight">
                      <span className="text-sm font-medium">{t.login}</span>
                      <span className="text-[10px] text-muted-foreground">{t.loginToWatch}</span>
                    </div>
                  </button>
                </LoginDialog>
              ) : (
                <div className="flex-1" />
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* User Avatar (ขวา) - แสดงเฉพาะเมื่อ login แล้ว */}
              {isAuthenticated && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={user.avatar} alt={user.displayName || user.email || "User avatar"} />
                          <AvatarFallback className="rounded-lg">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:grid text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {user.displayName || "TH#000000000"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {stats?.levelBadge} {stats?.title || t.member} • Lv.
                            {stats?.level || 1}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex flex-col gap-2 px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={user.avatar || ""} alt={user.displayName || user.email || "User avatar"} />
                            <AvatarFallback className="rounded-lg">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="font-medium truncate">
                              {user.displayName || user.username}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {stats && (
                          <div className="rounded-md bg-muted/50 p-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                {stats.levelBadge} Lv.{stats.level}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {stats.xp.toLocaleString()} XP
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-primary truncate">
                              {stats.title}
                            </div>
                            <Progress
                              value={stats.xpProgress}
                              className="mt-2 h-1.5"
                            />
                            <div className="mt-1 text-[10px] text-muted-foreground text-right">
                              {t.needXp} {stats.xpToNextLevel.toLocaleString()}{" "}
                              XP
                            </div>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Language Switcher */}
              <PublicLanguageSwitcher locale={locale as "th" | "en"} />
            </div>
          </header>

          {/* Chat Ticker */}
          <ChatTicker locale={locale as "th" | "en"} />

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
