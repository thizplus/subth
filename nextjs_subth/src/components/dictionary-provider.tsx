"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Category } from "@/features/category";

type Dictionary = Record<string, Record<string, string>>;

interface DictionaryContextType {
  dictionary: Dictionary;
  locale: string;
  categories: Category[];
  basePath: string;
  t: (key: string) => string;
  getLocalizedPath: (path: string) => string;
}

const DictionaryContext = createContext<DictionaryContextType | null>(null);

export function DictionaryProvider({
  children,
  dictionary,
  locale,
  categories = [],
  basePath = "", // "/member" สำหรับ protected routes, "" สำหรับ public
}: {
  children: ReactNode;
  dictionary: Dictionary;
  locale: string;
  categories?: Category[];
  basePath?: string;
}) {
  const t = (key: string): string => {
    const keys = key.split(".");
    let result: unknown = dictionary;
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof result === "string" ? result : key;
  };

  // Thai member: /member/videos
  // English member: /en/member/videos
  // Thai public: /videos
  // English public: /en/videos
  const getLocalizedPath = (path: string): string => {
    const fullPath = `${basePath}${path}`;
    if (locale === "th") {
      return fullPath;
    }
    return `/${locale}${fullPath}`;
  };

  return (
    <DictionaryContext.Provider value={{ dictionary, locale, categories, basePath, t, getLocalizedPath }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
