"use client";

import { useEffect, useState } from "react";
import {
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music2,
  Mail,
  Globe,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { contactChannelService } from "../service";
import type { ContactChannel, Platform } from "../types";

// Platform icon mapping
const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  telegram: Send,
  line: MessageCircle,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  email: Mail,
  website: Globe,
};


interface ContactChannelsProps {
  locale?: "th" | "en";
  showTitle?: boolean;
}

export function ContactChannels({ locale = "th", showTitle = true }: ContactChannelsProps) {
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await contactChannelService.getList();
        if (response.success) {
          setChannels(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch contact channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const title = locale === "th" ? "ติดต่อเรา" : "Contact Us";

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <div className="px-2 mb-2">
            <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {title}
            </h3>
          </div>
        )}
        <SidebarMenu>
          {[1, 2].map((i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton size="lg" className="cursor-default">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-muted animate-pulse" />
                <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    );
  }

  if (channels.length === 0) {
    return null;
  }

  return (
    <div>
      {showTitle && (
        <div className="px-2 mb-2">
          <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {title}
          </h3>
        </div>
      )}
      <SidebarMenu>
        {channels.map((channel) => {
        const Icon = PLATFORM_ICONS[channel.platform] || Globe;

        return (
          <SidebarMenuItem key={channel.id}>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group bg-sidebar-accent"
            >
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Icon - same size as Avatar in nav-user */}
                <div className="h-8 w-8 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>

                {/* Text content - exact same style as nav-user */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {channel.title}
                  </span>
                  {channel.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {channel.description}
                    </span>
                  )}
                </div>
                <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
      </SidebarMenu>
    </div>
  );
}
