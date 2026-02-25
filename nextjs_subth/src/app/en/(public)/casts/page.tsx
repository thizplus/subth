import { Metadata } from "next";
import Link from "next/link";
import { castService } from "@/features/cast";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 48;

export const metadata: Metadata = {
  title: "All Actresses | SubTH",
  description: "Browse all actresses on SubTH with reviews and detailed analysis",
  alternates: {
    canonical: "https://subth.com/en/casts",
    languages: {
      th: "https://subth.com/casts",
      en: "https://subth.com/en/casts",
    },
  },
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function CastsPageEN({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const searchQuery = params.q || "";

  let casts: import("@/features/cast").Cast[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await castService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
      search: searchQuery,
    });
    casts = response.data;
    total = response.meta.total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch casts:", e);
  }

  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          All Actresses
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse all actresses with reviews and analysis
        </p>

        <div className="mb-6">
          <SearchInput
            placeholder="Search actresses..."
            defaultValue={searchQuery}
            basePath="/en/casts"
          />
        </div>

        {casts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {casts.map((cast) => (
              <Link
                key={cast.id}
                href={`/en/casts/${cast.slug}`}
                className="flex flex-col items-center p-3 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
                  style={{ backgroundColor: stringToColor(cast.slug) }}
                >
                  {cast.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-center text-sm truncate w-full">
                  {cast.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cast.videoCount?.toLocaleString() || 0} videos
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No actresses found" : "No actress data available"}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/en/casts"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
