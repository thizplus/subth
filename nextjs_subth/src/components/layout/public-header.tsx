"use client";

import Link from "next/link";
import { ModeToggle, Logo } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { LoginDialog, useAuthStore } from "@/features/auth";
import { PublicLanguageSwitcher } from "./public-language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useMyStats } from "@/features/user-stats";
import { Progress } from "@/components/ui/progress";
import { OnlineStats } from "./online-stats";

interface PublicHeaderProps {
  locale?: "th" | "en";
}

/**
 * Simple header for public pages (feed, reels)
 * ไม่ต้องใช้ DictionaryProvider เหมือน Header หลัก
 */
export function PublicHeader({ locale = "th" }: PublicHeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: stats } = useMyStats();
  const loginText = locale === "th" ? "เข้าสู่ระบบ" : "Login";
  const logoutText = locale === "th" ? "ออกจากระบบ" : "Logout";

  // Get initials for avatar fallback - use email prefix
  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href={locale === "th" ? "/" : "/en"} className="flex items-center">
          <Logo className="h-12 w-auto" />
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Online Stats - ข้างๆ ปุ่ม Login */}
          <OnlineStats locale={locale} />
          <PublicLanguageSwitcher locale={locale} />
          <ModeToggle />

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
                    <div className="grid text-left text-sm leading-tight">
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
              <Button variant="default" size="sm">
                {loginText}
              </Button>
            </LoginDialog>
          )}
        </div>
      </div>
    </header>
  );
}
