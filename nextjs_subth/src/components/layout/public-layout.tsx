"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PublicSidebar } from "./public-sidebar";
import { PublicLanguageSwitcher } from "./public-language-switcher";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/theme";
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
import { OnlineStats } from "./online-stats";
import { ChatProvider, ChatTicker, ChatFab } from "@/features/community-chat";

interface PublicLayoutProps {
  children: ReactNode;
  locale?: "th" | "en";
}

/**
 * PublicLayout - Layout with sidebar for public pages (/, /en)
 * Similar to MemberLayout but simpler menu (no search, fewer items)
 */
export function PublicLayout({ children, locale = "th" }: PublicLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: stats } = useMyStats();
  const logoutText = locale === "th" ? "ออกจากระบบ" : "Logout";

  // Get initials for avatar fallback - use email prefix
  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <ChatProvider locale={locale}>
      <SidebarProvider>
        <PublicSidebar locale={locale} />
        <SidebarInset>
          {/* Header - similar to MemberHeader but without search */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            {/* Online Stats - ชิดซ้าย */}
            <OnlineStats locale={locale} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Auth Button - ขวาสุด ข้างๆ Language Switcher */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="rounded-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Desktop: แสดงครบ, Mobile: แค่ Avatar */}
                      <div className="hidden sm:grid text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.displayName || "TH#000000000"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {stats?.levelBadge} {stats?.title || (locale === "th" ? "สมาชิก" : "Member")} • Lv.{stats?.level || 1}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex flex-col gap-2 px-2 py-2">
                      {/* Avatar & DisplayName */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage src={user.avatar || ""} />
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

                      {/* Level & Title */}
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
                          <Progress value={stats.xpProgress} className="mt-2 h-1.5" />
                          <div className="mt-1 text-[10px] text-muted-foreground text-right">
                            {locale === "th" ? "อีก" : "Need"} {stats.xpToNextLevel.toLocaleString()} XP
                          </div>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutText}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginDialog locale={locale}>
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  {locale === "th" ? "เข้าสู่ระบบ" : "Login"}
                </Button>
              </LoginDialog>
            )}

            {/* Language Switcher */}
            <PublicLanguageSwitcher locale={locale} />
          </div>
        </header>

        {/* Chat Ticker */}
        <ChatTicker locale={locale} />

        {/* Main Content - no horizontal padding on mobile for edge-to-edge feed */}
        <main className="flex-1 overflow-auto px-0 py-4 sm:px-4">
          {children}
        </main>

        {/* Chat FAB */}
        <ChatFab />
      </SidebarInset>
    </SidebarProvider>
    </ChatProvider>
  );
}
