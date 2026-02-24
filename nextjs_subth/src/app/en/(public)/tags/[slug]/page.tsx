import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tagService } from "@/features/tag";
import { articleService, ArticleCard, ArticleBreadcrumb } from "@/features/article";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const tag = await tagService.getBySlug(slug, "en");
    return {
      title: `${tag.name} - Articles | SubTH`,
      description: `Browse all articles tagged with ${tag.name}`,
    };
  } catch {
    return {
      title: "Tag Not Found | SubTH",
    };
  }
}

export default async function TagDetailPageEN({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || "1", 10);

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
      <div className="mx-auto max-w-7xl px-4">
        <ArticleBreadcrumb
          items={[
            { label: "Tags", href: "/en/tags" },
            { label: tag.name },
          ]}
          locale="en"
        />

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
              <ArticleCard key={article.slug} article={article} locale="en" />
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
