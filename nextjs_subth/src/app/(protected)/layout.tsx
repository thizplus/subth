import { DictionaryProvider } from "@/components/dictionary-provider";
import { MemberSidebar, MemberHeader } from "@/components/member";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categoryService, Category } from "@/features/category";
import { cookies } from "next/headers";
import { MemberAuthGuard } from "./auth-guard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary("th");

  let categories: Category[] = [];
  try {
    categories = await categoryService.getList("th");
  } catch (e) {
    console.error("Failed to fetch categories:", e);
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState !== "false";

  return (
    <DictionaryProvider dictionary={dictionary} locale="th" categories={categories} basePath="">
      <MemberAuthGuard>
        <SidebarProvider defaultOpen={defaultOpen}>
          <MemberSidebar locale="th" categories={categories} />
          <SidebarInset className="w-0 min-w-0">
            <MemberHeader locale="th" />
            <div className="flex-1 p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </MemberAuthGuard>
    </DictionaryProvider>
  );
}
