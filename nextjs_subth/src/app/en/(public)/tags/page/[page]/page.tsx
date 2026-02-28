import { Metadata } from "next";
import Link from "next/link";
import { tagService } from "@/features/tag";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 60;
import { SITE_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  const currentPage = parseInt(page || "1", 10);

  // page > 5 → noindex, follow (ลด crawl budget leak)
  const shouldIndex = currentPage <= 5;

  return {
    title: currentPage === 1 ? "All Tags | SubTH" : `All Tags - Page ${currentPage} | SubTH`,
    description: "Browse all tags and categories on SubTH",
    robots: {
      index: shouldIndex,
      follow: true,
    },
    alternates: {
      canonical: currentPage === 1 ? `${SITE_URL}/en/tags` : `${SITE_URL}/en/tags/page/${currentPage}`,
    },
  };
}

export default async function TagsPagePaginatedEN({ params, searchParams }: PageProps) {
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
      lang: "en",
      search: searchQuery,
    });
    tags = response.data;
    total = response.meta.total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch tags:", e);
  }

  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          All Tags
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse all tags and categories
        </p>

        <div className="mb-6">
          <SearchInput
            placeholder="Search tags..."
            defaultValue={searchQuery}
            basePath="/en/tags"
          />
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/en/tags/${tag.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <span className="text-sm">{tag.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({tag.videoCount?.toLocaleString() || 0})
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No tags found" : "No tag data available"}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/en/tags"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
