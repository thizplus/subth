"use client";

import { Fragment } from "react";
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
import { useDictionary } from "@/components/dictionary-provider";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface ArticleBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export function ArticleBreadcrumb({ items }: ArticleBreadcrumbProps) {
  const { t, getLocalizedPath } = useDictionary();
  const homeHref = getLocalizedPath("/");
  const homeLabel = t("article.home");

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
            <Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
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
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
