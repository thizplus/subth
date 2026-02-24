"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  LogIn,
  Play,
  Users,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, LoginDialog } from "@/features/auth";
import { useDictionary } from "@/components/dictionary-provider";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isCenter?: boolean;
}

/**
 * BottomNav - Mobile bottom navigation (5 items)
 * ใช้ useDictionary() สำหรับ i18n
 * ปุ่มกลางเปลี่ยนตาม auth state
 */
export function BottomNav() {
  const pathname = usePathname();
  const { dictionary, locale, getLocalizedPath } = useDictionary();
  const { isAuthenticated } = useAuthStore();
  const t = dictionary.common;

  // Fixed 5 menu items (excluding center button)
  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: t.home },
    { href: "/articles", icon: BookOpen, label: t.articles },
    { href: "/casts", icon: Users, label: t.casts },
    { href: "/tags", icon: LayoutGrid, label: t.categories },
  ];

  // Split into left and right sides
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  const renderNavItem = (item: NavItem) => {
    const href = getLocalizedPath(item.href);
    const isActive =
      pathname === href ||
      (item.href !== "/" && pathname.startsWith(href));

    return (
      <Link
        key={item.href}
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground active:text-foreground"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-[10px]">{item.label}</span>
      </Link>
    );
  };

  // Center button content
  const CenterButton = () => {
    if (isAuthenticated) {
      // Logged in: go to member area
      return (
        <Link
          href={getLocalizedPath("/member")}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
            <Play className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium mt-0.5 text-primary">
            {t.watchVideo}
          </span>
        </Link>
      );
    }

    // Not logged in: open login dialog
    return (
      <LoginDialog locale={locale as "th" | "en"}>
        <button className="flex flex-col items-center justify-center -mt-5">
          <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
            <LogIn className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium mt-0.5 text-primary">
            {t.login}
          </span>
        </button>
      </LoginDialog>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="grid grid-cols-5 h-14">
        {/* Left 2 items */}
        {leftItems.map(renderNavItem)}

        {/* Center button */}
        <CenterButton />

        {/* Right 2 items */}
        {rightItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
