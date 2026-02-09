import { castService } from "@/features/cast/service";
import { Cast } from "@/features/cast/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 48;

// สร้างสีจาก string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

// แปลง slug เป็นชื่อ English
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CastsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dict = await getDictionary("th");
  const searchQuery = params.q || "";
  const currentPage = 1;

  let casts: Cast[] = [];
  let total = 0;

  try {
    const response = await castService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
      search: searchQuery,
    });
    casts = response.data;
    total = response.meta.total;
  } catch (e) {
    console.error("Failed to fetch casts:", e);
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {dict.common.casts}{" "}
        <span className="text-muted-foreground">({total.toLocaleString()})</span>
      </h1>

      <div className="mb-6">
        <SearchInput
          placeholder={dict.search.placeholder}
          defaultValue={searchQuery}
          basePath="/member/casts"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {casts.map((cast) => (
          <Link
            key={cast.id}
            href={`/member/casts/${cast.slug}`}
            className="flex flex-col items-center p-3 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
              style={{ backgroundColor: stringToColor(cast.slug) }}
            >
              {cast.name.charAt(0).toUpperCase()}
            </div>
            <p className="font-medium text-center text-sm truncate w-full">{cast.name}</p>
            <p className="text-xs text-muted-foreground text-center truncate w-full">
              {slugToName(cast.slug)}
            </p>
            <p className="text-xs text-muted-foreground">
              {cast.videoCount.toLocaleString()} {dict.cast.videos}
            </p>
          </Link>
        ))}
      </div>

      {casts.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{dict.common.noResults}</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/member/casts"
        searchQuery={searchQuery}
      />
    </div>
  );
}
