import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { PublicLayoutClient } from "./public-layout-client";
import { categoryService, type Category } from "@/features/category";

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
  locale: Locale;
}

/**
 * PublicLayoutWrapper - Server Component
 * โหลด dictionary และ categories แล้วส่งให้ DictionaryProvider
 */
export async function PublicLayoutWrapper({
  children,
  locale,
}: PublicLayoutWrapperProps) {
  const dictionary = await getDictionary(locale);

  let categories: Category[] = [];
  try {
    categories = await categoryService.getList(locale);
  } catch (e) {
    console.error("Failed to fetch categories:", e);
  }

  return (
    <DictionaryProvider
      dictionary={dictionary}
      locale={locale}
      categories={categories}
      basePath="" // public ไม่มี basePath
    >
      <PublicLayoutClient>{children}</PublicLayoutClient>
    </DictionaryProvider>
  );
}
