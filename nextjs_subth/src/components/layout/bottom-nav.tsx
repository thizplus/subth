"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Bot, Tags, Users, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isAI?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const { dictionary, categories, getLocalizedPath } = useDictionary();
  const t = dictionary.common;

  // สร้าง nav items จาก categories
  const categoryItems: NavItem[] = categories.map((cat) => ({
    href: `/category/${cat.slug}`,
    icon: Film,
    label: cat.name,
  }));

  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: t.home },
    ...categoryItems,
    { href: "/ai-search", icon: Bot, label: t.smartMode, isAI: true },
    { href: "/tags", icon: Tags, label: t.tags },
    { href: "/casts", icon: Users, label: t.casts },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div
        className="grid py-2"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}
      >
        {navItems.map((item) => {
          const href = getLocalizedPath(item.href);
          const isActive = pathname === href ||
            (item.href !== "/" && pathname.startsWith(href));

          if (item.isAI) {
            return (
              <Link
                key={item.href}
                href={href}
                className="flex flex-col items-center justify-center p-2 text-primary -mt-10"
              >
                <div className="relative">
                  <div className="rounded-full bg-primary p-4 text-primary-foreground shadow-lg fab-glow">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <span className="absolute inset-0 rounded-full bg-primary/30 fab-ring" />
                </div>
                <span className="text-xs font-medium mt-1 truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
