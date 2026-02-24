"use client";

import { useMemo, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArticleContent } from "../types";

interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  content: ArticleContent;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // สร้าง TOC items แบบ dynamic ตามเนื้อหาที่มี
  const tocItems = useMemo(() => {
    const items: TOCItem[] = [];

    if (content.summary) {
      items.push({ id: "summary", label: "เรื่องย่อ" });
    }
    if (content.characterJourney || (content.emotionalArc && content.emotionalArc.length > 0)) {
      items.push({ id: "character-journey", label: "พัฒนาการตัวละคร" });
    }
    if (content.cinematographyAnalysis || content.visualStyle) {
      items.push({ id: "cinematography", label: "วิเคราะห์งานภาพ" });
    }
    if (content.galleryImages && content.galleryImages.length > 0) {
      items.push({ id: "gallery", label: "แกลเลอรี" });
    }
    if (content.detailedReview) {
      items.push({ id: "review", label: "รีวิวละเอียด" });
    }
    if (content.thematicExplanation || content.culturalContext || content.studioComparison) {
      items.push({ id: "educational", label: "บริบทเชิงลึก" });
    }
    if (content.viewingTips || (content.bestMoments && content.bestMoments.length > 0)) {
      items.push({ id: "viewing-tips", label: "คำแนะนำการรับชม" });
    }
    if (content.faqItems && content.faqItems.length > 0) {
      items.push({ id: "faq", label: "คำถามที่พบบ่อย" });
    }

    return items;
  }, [content]);

  // ไม่แสดง TOC ถ้ามีน้อยกว่า 3 sections
  if (tocItems.length < 3) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 transition-colors hover:bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">สารบัญ</p>
              <p className="text-sm text-muted-foreground">
                {tocItems.length} หัวข้อ - กดเพื่อข้ามไปอ่าน
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="grid gap-1 border-t bg-background/50 p-3">
            {tocItems.map(({ id, label }, index) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-primary/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span>{label}</span>
              </a>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
