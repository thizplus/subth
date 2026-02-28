"use client";

import { createContext, useContext, ReactNode } from "react";

interface ArticleTranslationsContextValue {
  translations?: Record<string, string>; // {"en": "slug", "th": "slug"}
  articleType?: string; // "review", "ranking", etc.
}

const ArticleTranslationsContext = createContext<ArticleTranslationsContextValue>({});

interface ArticleTranslationsProviderProps {
  children: ReactNode;
  translations?: Record<string, string>;
  articleType?: string;
}

export function ArticleTranslationsProvider({
  children,
  translations,
  articleType,
}: ArticleTranslationsProviderProps) {
  return (
    <ArticleTranslationsContext.Provider value={{ translations, articleType }}>
      {children}
    </ArticleTranslationsContext.Provider>
  );
}

export function useArticleTranslations() {
  return useContext(ArticleTranslationsContext);
}
