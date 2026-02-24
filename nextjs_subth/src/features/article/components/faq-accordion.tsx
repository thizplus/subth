import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "../types";

interface FAQAccordionProps {
  faqItems: FAQItem[];
  technicalFaq?: FAQItem[];
  videoCode: string;
}

export function FAQAccordion({
  faqItems,
  technicalFaq,
}: FAQAccordionProps) {
  const allFaqs = [...faqItems, ...(technicalFaq || [])];

  if (!allFaqs.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <HelpCircle className="h-5 w-5 text-primary" />
        คำถามที่พบบ่อย
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
          {allFaqs.length}
        </span>
      </h2>

      <div className="overflow-hidden rounded-xl border">
        <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
          {allFaqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="gap-3 px-4 text-left hover:no-underline [&[data-state=open]]:bg-muted/50">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="ml-9 mt-1 leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
