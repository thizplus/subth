import "server-only";

const dictionaries = {
  th: () => import("../../../messages/th.json").then((module) => module.default),
  en: () => import("../../../messages/en.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export const locales = Object.keys(dictionaries) as Locale[];
export const defaultLocale: Locale = "th";

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
