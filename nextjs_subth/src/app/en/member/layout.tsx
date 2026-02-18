import { DictionaryProvider } from "@/components/dictionary-provider";
import { MemberSidebar, MemberHeader } from "@/components/member";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categoryService, Category } from "@/features/category";
import { SemanticSearchProvider } from "@/features/semantic-search";
import { ChatProvider, ChatFab, ChatTicker } from "@/features/community-chat";
import { MemberAuthGuard } from "@/app/member/auth-guard";
import { cookies } from "next/headers";

export default async function EnglishMemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary("en");

  let categories: Category[] = [];
  try {
    categories = await categoryService.getList("en");
  } catch (e) {
    console.error("Failed to fetch categories:", e);
  }

  // Get sidebar state from cookie
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState !== "false";

  return (
    <DictionaryProvider dictionary={dictionary} locale="en" categories={categories} basePath="/member">
      <MemberAuthGuard>
        <ChatProvider locale="en">
          <SidebarProvider defaultOpen={defaultOpen}>
            <MemberSidebar locale="en" categories={categories} />
            <SidebarInset>
              <MemberHeader locale="en" />
              <ChatTicker locale="en" />
              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
              <SemanticSearchProvider />
              <ChatFab />
            </SidebarInset>
          </SidebarProvider>
        </ChatProvider>
      </MemberAuthGuard>
    </DictionaryProvider>
  );
}
