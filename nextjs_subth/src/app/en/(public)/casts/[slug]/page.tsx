import { Metadata } from "next";
import { notFound } from "next/navigation";
import { castService } from "@/features/cast";
import { articleService, ArticleCard } from "@/features/article";
import { PublicLayout } from "@/components/layout";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const cast = await castService.getBySlug(slug, "en");
    return {
      title: `${cast.name} - Articles & Works | SubTH`,
      description: `Browse all articles and reviews featuring ${cast.name}`,
    };
  } catch {
    return {
      title: "Actress Not Found | SubTH",
    };
  }
}

export default async function CastDetailPageEN({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || "1", 10);

  let cast;
  try {
    cast = await castService.getBySlug(slug, "en");
  } catch {
    notFound();
  }

  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getByCast(slug, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles by cast:", e);
  }

  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0"
            style={{ backgroundColor: stringToColor(slug) }}
          >
            {cast.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{cast.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cast.videoCount?.toLocaleString() || 0} videos
              {total > 0 && ` • ${total} articles`}
            </p>
          </div>
        </div>

        {cast.bio && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50">
            <h2 className="font-semibold mb-2">Biography</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {cast.bio}
            </p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">
          Articles
          <span className="text-muted-foreground font-normal ml-2">({total})</span>
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} locale="en" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles available for this actress yet
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/en/casts/${slug}`}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
