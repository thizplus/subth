"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Users,
  User,
  LucideIcon,
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

/**
 * MemberBottomNav - Mobile bottom navigation for member area
 * 5 items: Search, AI Search, Latest (center), Casts, Profile
 */
export function MemberBottomNav() {
  const pathname = usePathname();
  const { dictionary, getLocalizedPath } = useDictionary();
  const t = dictionary.common;
  const tHome = dictionary.home;

  // Paths relative to basePath (which is "/member" in DictionaryProvider)
  const navItems: NavItem[] = [
    { href: "/search", icon: Search, label: t.search },
    { href: "/ai-search", icon: Sparkles, label: "AI" },
    { href: "/casts", icon: Users, label: t.casts },
    { href: "/profile", icon: User, label: t.profile },
  ];

  // Split into left and right sides
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  const renderNavItem = (item: NavItem) => {
    const href = getLocalizedPath(item.href);
    const isActive = pathname.startsWith(href);

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

  // Center button - Latest/Home (อัพเดทล่าสุด)
  const CenterButton = () => {
    const homePath = getLocalizedPath("/");
    const isHomeActive = pathname === homePath || pathname === homePath.replace(/\/$/, "");

    return (
      <Link
        href={homePath}
        className="flex flex-col items-center justify-center -mt-5"
      >
        <div
          className={cn(
            "rounded-full p-3 shadow-lg transition-colors",
            isHomeActive
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          <Flame className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-medium mt-0.5 text-primary">
          {tHome.latest}
        </span>
      </Link>
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
