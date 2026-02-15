"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ModeToggle, Logo } from "@/components/theme";
import { useAuthStore } from "@/features/auth";
import { RecentComments } from "@/features/engagement";

interface PublicSidebarProps {
  locale?: "th" | "en";
}

export function PublicSidebar({ locale = "th" }: PublicSidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { setOpenMobile } = useSidebar();

  const isEnglish = locale === "en";
  const basePath = isEnglish ? "/en" : "";

  // ปิด sidebar บน mobile เมื่อกดเมนู
  const handleMenuClick = () => {
    setOpenMobile(false);
  };

  const labels = {
    th: { menu: "เมนู", feed: "ฟีด", member: "เข้าสู่หน้าสมาชิก" },
    en: { menu: "Menu", feed: "Feed", member: "Go to Member" },
  };
  const t = labels[locale];

  const menuItems = [
    {
      title: t.feed,
      href: `${basePath}/`,
      icon: Home,
    },
    {
      title: "Reels",
      href: `${basePath}/reels`,
      icon: Film,
    },
  ];

  const isActive = (url: string) => {
    if (url === `${basePath}/`) {
      return pathname === url || pathname === basePath;
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`${basePath}/`} className="flex items-center">
            <Logo className="h-10 w-auto group-data-[collapsible=icon]:h-8" />
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <ModeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Member link - บนสุด เด่นชัด */}
        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={t.member}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  >
                    <Link href={`${basePath}/member`} onClick={handleMenuClick}>
                      <User />
                      <span>{t.member}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{t.menu}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href} onClick={handleMenuClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Comments - ซ่อนเมื่อ sidebar collapsed */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <RecentComments locale={locale} limit={10} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
