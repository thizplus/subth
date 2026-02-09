import { tagService } from "@/features/tag/service";
import { Tag } from "@/features/tag/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 100;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function TagsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dict = await getDictionary("th");
  const searchQuery = params.q || "";
  const currentPage = 1;

  let tags: Tag[] = [];
  let total = 0;

  try {
    const response = await tagService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
      search: searchQuery,
    });
    tags = response.data;
    total = response.meta.total;
  } catch (e) {
    console.error("Failed to fetch tags:", e);
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {dict.common.tags}{" "}
        <span className="text-muted-foreground">({total.toLocaleString()})</span>
      </h1>

      <div className="mb-6">
        <SearchInput
          placeholder={dict.search.placeholder}
          defaultValue={searchQuery}
          basePath="/member/tags"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/member/tags/${tag.slug}`}
            className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
          >
            <span className="font-medium">{tag.name}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({tag.videoCount.toLocaleString()})
            </span>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{dict.common.noResults}</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/member/tags"
        searchQuery={searchQuery}
      />
    </div>
  );
}
