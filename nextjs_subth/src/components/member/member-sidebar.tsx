"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Tags,
  Sparkles,
  ChevronRight,
  type LucideIcon,
  Grid3X3,
  LogOut,
  Search,
} from "lucide-react";
import { ModeToggle, Logo } from "@/components/theme";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { MemberNavUser } from "./member-nav-user";
import type { Category } from "@/features/category";
import { ContactChannels } from "@/features/contact-channel";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: { title: string; url: string }[];
}

interface MemberSidebarProps {
  locale: "th" | "en";
  categories: Category[];
}

export function MemberSidebar({ locale, categories }: MemberSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const basePath = locale === "th" ? "/member" : "/en/member";

  // ปิด sidebar บน mobile เมื่อกดเมนู
  const handleMenuClick = () => {
    setOpenMobile(false);
  };

  // Navigation labels based on locale
  const labels = {
    th: {
      menu: "เมนู",
      home: "หน้าแรก",
      search: "ค้นหา",
      categories: "หมวดหมู่",
      casts: "นักแสดง",
      tags: "แท็ก",
      aiSearch: "AI Search",
      exitToMain: "ออกไปหน้าหลัก",
    },
    en: {
      menu: "Menu",
      home: "Home",
      search: "Search",
      categories: "Categories",
      casts: "Casts",
      tags: "Tags",
      aiSearch: "AI Search",
      exitToMain: "Exit to Main",
    },
  };

  const t = labels[locale];

  // Build navigation items
  const navItems: NavItem[] = [
    {
      title: t.home,
      url: basePath,
      icon: Home,
    },
    {
      title: t.search,
      url: `${basePath}/search`,
      icon: Search,
    },
    {
      title: t.categories,
      url: `${basePath}/category`,
      icon: Grid3X3,
      items: categories.map((cat) => ({
        title: cat.name,
        url: `${basePath}/category/${cat.slug}`,
      })),
    },
    {
      title: t.casts,
      url: `${basePath}/casts`,
      icon: Users,
    },
    {
      title: t.tags,
      url: `${basePath}/tags`,
      icon: Tags,
    },
    {
      title: t.aiSearch,
      url: `${basePath}/ai-search`,
      icon: Sparkles,
    },
  ];

  const isActive = (url: string) => {
    if (url === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-start justify-between">
          <Link href={basePath} className="flex items-center" onClick={handleMenuClick}>
            <Logo className="h-10 w-auto group-data-[collapsible=icon]:h-8" />
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <ModeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.menu}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) =>
              item.items && item.items.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={true}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.url}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url} onClick={handleMenuClick}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <Link href={item.url} onClick={handleMenuClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Exit to main page - เด่นชัด */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={t.exitToMain}
                  className="bg-[var(--btn-cta-bg)] text-white hover:bg-[var(--btn-cta-bg)]/90 hover:text-white"
                >
                  <Link href={locale === "th" ? "/" : "/en"} onClick={handleMenuClick}>
                    <LogOut />
                    <span>{t.exitToMain}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Contact Channels - ซ่อนเมื่อ sidebar collapsed */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden p-0">
          <SidebarGroupContent>
            <ContactChannels locale={locale} showTitle={false} />
          </SidebarGroupContent>
        </SidebarGroup>
        <MemberNavUser locale={locale} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
