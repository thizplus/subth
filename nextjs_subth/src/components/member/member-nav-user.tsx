"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/features/auth/store";
import { useMyStats } from "@/features/user-stats";
import { Progress } from "@/components/ui/progress";

interface MemberNavUserProps {
  locale: "th" | "en";
}

export function MemberNavUser({ locale }: MemberNavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: stats } = useMyStats();

  const handleLogout = () => {
    logout();
    router.push(locale === "th" ? "/" : "/en");
  };

  const logoutLabel = locale === "th" ? "ออกจากระบบ" : "Log out";
  const profileLabel = locale === "th" ? "โปรไฟล์" : "Profile";
  const basePath = locale === "th" ? "/member" : "/en/member";

  // Get display name - use title only (not personal name)
  const getDisplayName = () => {
    if (stats?.title) {
      return stats.title;
    }
    return locale === "th" ? "สมาชิก" : "Member";
  };

  // Get initials for avatar fallback - use email prefix
  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  if (!user) {
    return null;
  }

  const displayName = getDisplayName();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar || ""} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {stats?.levelBadge} {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {stats ? `Lv.${stats.level}` : user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-2 py-2">
                {/* Avatar & DisplayName */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={user.avatar || ""} alt={displayName} />
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
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/profile`}>
                <User />
                {profileLabel}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              {logoutLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
