import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tagService } from "@/features/tag";
import { articleService, ArticleCard } from "@/features/article";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { PaginationHead } from "@/components/seo";
import { Tag } from "lucide-react";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const tag = await tagService.getBySlug(slug, "th");
    return {
      title: `${tag.name} - บทความและรีวิว | SubTH`,
      description: tag.description || `รวมบทความรีวิวในหมวด ${tag.name} พร้อมวิเคราะห์เชิงลึก`,
    };
  } catch {
    return {
      title: "ไม่พบแท็ก | SubTH",
    };
  }
}

export default async function TagDetailPagePaginated({ params }: PageProps) {
  const { slug, page } = await params;
  const currentPage = parseInt(page || "1", 10);

  // Fetch tag info
  let tag;
  try {
    tag = await tagService.getBySlug(slug, "th");
  } catch {
    notFound();
  }

  // Fetch articles by this tag
  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getByTag(slug, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles by tag:", e);
  }

  return (
    <PublicLayout locale="th">
      {/* SEO: rel="prev/next" for pagination */}
      <PaginationHead
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tags/${slug}`}
      />
      <div className="mx-auto max-w-7xl px-4">
        {/* Tag Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tag.name}</h1>
            <p className="text-sm text-muted-foreground">
              {tag.videoCount?.toLocaleString() || 0} วิดีโอ
              {total > 0 && ` • ${total} บทความ`}
            </p>
          </div>
        </div>

        {/* Description */}
        {tag.description && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tag.description}
            </p>
          </div>
        )}

        {/* Articles Section */}
        <h2 className="text-xl font-semibold mb-4">
          บทความในแท็กนี้
          <span className="text-muted-foreground font-normal ml-2">
            ({total})
          </span>
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} locale="th" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            ยังไม่มีบทความในแท็กนี้
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/tags/${slug}`}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
