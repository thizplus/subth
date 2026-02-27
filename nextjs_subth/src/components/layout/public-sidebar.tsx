"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, FileText, Users, Tags } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { MemberNavUser } from "@/components/member";
import { ModeToggle, Logo } from "@/components/theme";
import { useAuthStore } from "@/features/auth";
import { ContactChannels } from "@/features/contact-channel";

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
    th: {
      menu: "เมนู",
      latestReviews: "รีวิวล่าสุด",
      allReviews: "รีวิวทั้งหมด",
      casts: "นักแสดง",
      tags: "แท็ก",
      memberTitle: "วิดีโอทั้งหมดของเรา",
      memberSubtitle: "JAV ซับไทย ครบทุกค่าย",
    },
    en: {
      menu: "Menu",
      latestReviews: "Latest Reviews",
      allReviews: "All Reviews",
      casts: "Casts",
      tags: "Tags",
      memberTitle: "All Our Videos",
      memberSubtitle: "JAV Thai Sub, All Studios",
    },
  };
  const t = labels[locale];

  const menuItems = [
    {
      title: t.latestReviews,
      href: `${basePath}/`,
      icon: Home,
    },
    {
      title: t.allReviews,
      href: `${basePath}/articles`,
      icon: FileText,
    },
    {
      title: t.casts,
      href: `${basePath}/casts`,
      icon: Users,
    },
    {
      title: t.tags,
      href: `${basePath}/tags`,
      icon: Tags,
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
          <Link href={`${basePath}/`} className="flex items-center" onClick={handleMenuClick}>
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
                    tooltip={t.memberTitle}
                    className="h-auto py-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  >
                    <Link href={`${basePath}/member`} onClick={handleMenuClick}>
                      <Play />
                      <div className="grid leading-tight">
                        <span className="font-medium">{t.memberTitle}</span>
                        <span className="text-xs opacity-80">{t.memberSubtitle}</span>
                      </div>
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

        {/* Contact Channels - ซ่อนเมื่อ sidebar collapsed */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
          <SidebarGroupContent>
            <ContactChannels locale={locale} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile - Footer */}
      {isAuthenticated && (
        <SidebarFooter>
          <MemberNavUser locale={locale} />
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
