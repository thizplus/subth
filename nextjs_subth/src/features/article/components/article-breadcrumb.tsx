import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface ArticleBreadcrumbProps {
  items: BreadcrumbItemType[];
  locale?: "th" | "en";
}

export function ArticleBreadcrumb({ items, locale = "th" }: ArticleBreadcrumbProps) {
  const homeHref = locale === "en" ? "/en" : "/";
  const homeLabel = locale === "en" ? "Home" : "หน้าแรก";

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={homeHref} className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only md:not-sr-only">{homeLabel}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <>
              <BreadcrumbSeparator key={`sep-${index}`} />
              <BreadcrumbItem key={`item-${index}`}>
                {isLast || !item.href ? (
                  <BreadcrumbPage
                    className="line-clamp-1 max-w-[200px]"
                    title={item.label}
                  >
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
