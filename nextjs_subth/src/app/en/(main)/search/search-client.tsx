"use client";

import { SearchAutocomplete } from "@/components/member/search-autocomplete";

interface SearchPageClientProps {
  locale: "th" | "en";
  defaultValue?: string;
}

export function SearchPageClient({ locale }: SearchPageClientProps) {
  return <SearchAutocomplete locale={locale} />;
}
