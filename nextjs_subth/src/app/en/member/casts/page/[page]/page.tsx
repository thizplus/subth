import { castService } from "@/features/cast/service";
import { Cast } from "@/features/cast/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 48;

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function PaginatedCastsPage({ params }: PageProps) {
  const { page } = await params;
  const currentPage = Number(page) || 1;

  if (currentPage === 1) {
    redirect("/en/member/casts");
  }

  const dict = await getDictionary("en");

  let casts: Cast[] = [];
  let total = 0;

  try {
    const response = await castService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
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
          basePath="/en/member/casts"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {casts.map((cast) => (
          <Link
            key={cast.id}
            href={`/en/member/casts/${cast.slug}`}
            className="flex flex-col items-center p-3 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
              style={{ backgroundColor: stringToColor(cast.slug) }}
            >
              {cast.name.charAt(0).toUpperCase()}
            </div>
            <p className="font-medium text-center text-sm truncate w-full">{cast.name}</p>
            <p className="text-xs text-muted-foreground">
              {cast.videoCount.toLocaleString()} {dict.cast.videos}
            </p>
          </Link>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/en/member/casts"
      />
    </div>
  );
}
