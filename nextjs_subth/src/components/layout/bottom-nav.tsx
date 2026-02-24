"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  PlayCircle,
  Users,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth";
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
  const { dictionary, getLocalizedPath } = useDictionary();
  const { isAuthenticated } = useAuthStore();
  const t = dictionary.common;

  // Login with redirect back
  const loginHref = `${getLocalizedPath("/login")}?redirect=${encodeURIComponent(pathname)}`;

  // Fixed 5 menu items
  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: t.home },
    { href: "/articles", icon: BookOpen, label: t.articles },
    // Center button: login/member
    {
      href: isAuthenticated ? "/member" : loginHref,
      icon: PlayCircle,
      label: isAuthenticated ? t.watchVideo : t.login,
      isCenter: true,
    },
    { href: "/casts", icon: Users, label: t.casts },
    { href: "/tags", icon: LayoutGrid, label: t.categories },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const href = item.isCenter
            ? item.href // Center button already has full path
            : getLocalizedPath(item.href);
          const isActive =
            pathname === href ||
            (item.href !== "/" && !item.isCenter && pathname.startsWith(href));

          // Center button - prominent styling
          if (item.isCenter) {
            return (
              <Link
                key="center"
                href={href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="relative">
                  <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
                <span className="text-[10px] font-medium mt-0.5 text-primary">
                  {item.label}
                </span>
              </Link>
            );
          }

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
        })}
      </div>
    </nav>
  );
}
