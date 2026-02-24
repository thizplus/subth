import { Metadata } from "next";
import { articleService, ArticleCard } from "@/features/article";
import { PublicLayout } from "@/components/layout";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 24;

export const metadata: Metadata = {
  title: "All Articles | SubTH",
  description: "Browse all articles with reviews and detailed analysis on SubTH",
};

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function ArticlesPagePaginatedEN({ params }: PageProps) {
  const { page } = await params;
  const currentPage = parseInt(page || "1", 10);

  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "en",
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles:", e);
  }

  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          All Articles
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse all articles with reviews and detailed analysis
        </p>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} locale="en" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles available yet
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/en/articles"
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
