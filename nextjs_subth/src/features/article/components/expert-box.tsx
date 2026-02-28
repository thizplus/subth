"use client";

import { Sparkles, MessageSquare, Users, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDictionary } from "@/components/dictionary-provider";

interface ExpertBoxProps {
  expertAnalysis?: string;
  dialogueAnalysis?: string;
  characterInsight?: string;
}

export function ExpertBox({
  expertAnalysis,
  dialogueAnalysis,
  characterInsight,
}: ExpertBoxProps) {
  const { t } = useDictionary();

  if (!expertAnalysis && !dialogueAnalysis && !characterInsight) {
    return null;
  }

  const sections = [
    {
      id: "expert",
      icon: Sparkles,
      title: t("article.expertAnalysis"),
      content: expertAnalysis,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "dialogue",
      icon: MessageSquare,
      title: t("article.dialogueAnalysis"),
      content: dialogueAnalysis,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "character",
      icon: Users,
      title: t("article.characterInsight"),
      content: characterInsight,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ].filter((s) => s.content);

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-5 w-5 text-primary" />
        {t("article.expertAnalysis")}
      </h2>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <Collapsible key={section.id} defaultOpen={index === 0}>
            <div className="overflow-hidden rounded-xl border">
              <CollapsibleTrigger className="flex w-full items-center justify-between bg-gradient-to-r from-muted/50 to-transparent p-4 text-left transition-colors hover:bg-muted/70">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${section.bg}`}>
                    <section.icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  <span className="font-medium">{section.title}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-4 py-3">
                  <p className="leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}
