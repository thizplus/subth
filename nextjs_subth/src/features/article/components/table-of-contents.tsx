"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between px-4 py-3 h-auto hover:bg-muted/50"
          >
            <span className="text-sm font-medium">
              ยาวไป อยากเลือกอ่าน?
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-2 py-2">
            {tocItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-start rounded-md px-3 h-9 text-sm font-normal hover:bg-muted transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
