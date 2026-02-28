"use client";

import Link from "next/link";
import { Clock, Building2, Users, Tag, Calendar, Subtitles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import type { CastProfile, MakerInfo } from "../types";

interface FactsTableProps {
  code: string;
  studio: string;
  cast: string[];
  duration: string;
  durationMinutes: number;
  genre: string[];
  releaseYear: string;
  subtitleAvailable: boolean;
  // Optional linked profiles
  castProfiles?: CastProfile[];
  makerInfo?: MakerInfo;
  className?: string;
}

export function FactsTable({
  code,
  studio,
  cast,
  duration,
  durationMinutes,
  genre,
  releaseYear,
  subtitleAvailable,
  castProfiles,
  makerInfo,
  className,
}: FactsTableProps) {
  const { t, getLocalizedPath } = useDictionary();

  // Build cast display with links if profiles available
  const renderCast = () => {
    if (castProfiles && castProfiles.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {castProfiles.map((profile, i) => (
            <span key={profile.id}>
              <Link
                href={getLocalizedPath(`/casts/${profile.id}`)}
                className="text-primary hover:underline"
                itemProp="actor"
              >
                {profile.name}
              </Link>
              {i < castProfiles.length - 1 && ", "}
            </span>
          ))}
        </div>
      );
    }
    return <span itemProp="actor">{cast.join(", ")}</span>;
  };

  // Build studio display with link if makerInfo available
  const renderStudio = () => {
    if (makerInfo) {
      return (
        <Link
          href={getLocalizedPath(`/makers/${makerInfo.id}`)}
          className="text-primary hover:underline"
          itemProp="productionCompany"
        >
          {makerInfo.name}
        </Link>
      );
    }
    return <span itemProp="productionCompany">{studio}</span>;
  };

  const facts = [
    {
      icon: Tag,
      label: t("video.code"),
      value: code,
      itemProp: "identifier",
    },
    {
      icon: Building2,
      label: t("article.makerLabel"),
      value: renderStudio(),
    },
    {
      icon: Users,
      label: t("article.castLabel"),
      value: renderCast(),
    },
    {
      icon: Clock,
      label: t("article.duration"),
      value: duration,
      itemProp: "duration",
      itemValue: `PT${durationMinutes}M`,
    },
    {
      icon: Calendar,
      label: t("video.releaseDate"),
      value: releaseYear,
      itemProp: "datePublished",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 my-6",
        className
      )}
      itemScope
      itemType="https://schema.org/Movie"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {facts.map((fact, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2">
              <fact.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{fact.label}</p>
              <div className="font-medium text-sm truncate">
                {fact.itemProp ? (
                  <span itemProp={fact.itemProp} content={fact.itemValue}>
                    {fact.value}
                  </span>
                ) : (
                  fact.value
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Genre tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {genre.map((g, i) => (
          <span
            key={i}
            className="px-2.5 py-1 text-xs bg-muted rounded-full"
            itemProp="genre"
          >
            {g}
          </span>
        ))}
        {subtitleAvailable && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full">
            <Subtitles className="h-3 w-3" />
            ซับไทย
          </span>
        )}
      </div>
    </div>
  );
}
