import { Metadata } from "next";
import Link from "next/link";
import { tagService } from "@/features/tag";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Tag } from "lucide-react";

const ITEMS_PER_PAGE = 100;

export const metadata: Metadata = {
  title: "หมวดหมู่ทั้งหมด | SubTH",
  description: "รายการหมวดหมู่และแท็กทั้งหมดใน SubTH สำหรับค้นหาบทความตามประเภท",
};

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function TagsPagePaginated({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const searchQuery = sp.q || "";

  let tags: import("@/features/tag").Tag[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await tagService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
      search: searchQuery,
    });
    tags = response.data;
    total = response.meta.total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch tags:", e);
  }

  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          แท็กทั้งหมด
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          ค้นหาบทความตามแท็กที่สนใจ
        </p>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="ค้นหาแท็ก..."
            defaultValue={searchQuery}
            basePath="/tags"
          />
        </div>

        {/* Tags Grid */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors"
              >
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{tag.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({tag.videoCount?.toLocaleString() || 0})
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "ไม่พบแท็กที่ค้นหา" : "ยังไม่มีข้อมูลแท็ก"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/tags"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
