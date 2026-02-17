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
  Loader2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
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

// Platform colors for gradient effect
const PLATFORM_COLORS: Record<Platform, string> = {
  telegram: "from-[#0088cc] to-[#0077b5]",
  line: "from-[#00C300] to-[#00B900]",
  facebook: "from-[#1877F2] to-[#0866FF]",
  twitter: "from-[#1DA1F2] to-[#0C7ABF]",
  instagram: "from-[#E4405F] to-[#C13584]",
  youtube: "from-[#FF0000] to-[#CC0000]",
  tiktok: "from-[#000000] to-[#25F4EE]",
  email: "from-[#EA4335] to-[#C5221F]",
  website: "from-[#6366F1] to-[#4F46E5]",
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
      <div className="px-2">
        {showTitle && (
          <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="px-2">
      {showTitle && (
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {channels.map((channel) => {
          const Icon = PLATFORM_ICONS[channel.platform] || Globe;
          const gradientColor = PLATFORM_COLORS[channel.platform] || PLATFORM_COLORS.website;

          return (
            <a
              key={channel.id}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
            >
              {/* Icon with gradient background */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-sm`}
              >
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm truncate">
                    {channel.title}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {channel.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {channel.description}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
