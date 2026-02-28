import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tagService } from "@/features/tag";
import { articleService, ArticleCard } from "@/features/article";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { PaginationHead } from "@/components/seo";

const ITEMS_PER_PAGE = 24;
import { SITE_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const currentPage = parseInt(page || "1", 10);

  // page > 5 → noindex, follow (ลด crawl budget leak)
  const shouldIndex = currentPage <= 5;

  try {
    const tag = await tagService.getBySlug(slug, "en");
    return {
      title: currentPage === 1
        ? `${tag.name} - Articles | SubTH`
        : `${tag.name} - Page ${currentPage} | SubTH`,
      description: `Browse all articles tagged with ${tag.name}`,
      robots: {
        index: shouldIndex,
        follow: true,
      },
      alternates: {
        canonical: currentPage === 1
          ? `${SITE_URL}/en/tags/${slug}`
          : `${SITE_URL}/en/tags/${slug}/page/${currentPage}`,
      },
    };
  } catch {
    return {
      title: "Tag Not Found | SubTH",
    };
  }
}

export default async function TagDetailPagePaginatedEN({ params }: PageProps) {
  const { slug, page } = await params;
  const currentPage = parseInt(page || "1", 10);

  let tag;
  try {
    tag = await tagService.getBySlug(slug, "en");
  } catch {
    notFound();
  }

  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getByTag(slug, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles by tag:", e);
  }

  return (
    <PublicLayout locale="en">
      {/* SEO: rel="prev/next" for pagination */}
      <PaginationHead
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/en/tags/${slug}`}
      />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{tag.name}</h1>
          {tag.description && (
            <p className="text-muted-foreground mt-2">{tag.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {tag.videoCount?.toLocaleString() || 0} videos
            {total > 0 && ` • ${total} articles`}
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Articles
          <span className="text-muted-foreground font-normal ml-2">({total})</span>
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles available for this tag yet
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/en/tags/${slug}`}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
