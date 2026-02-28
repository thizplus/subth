import { Metadata } from "next";
import { articleService, ArticleCard } from "@/features/article";
import { PublicLayout } from "@/components/layout/server";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationHead } from "@/components/seo";

const ITEMS_PER_PAGE = 24;
const BASE_URL = "https://subth.com";

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  const currentPage = parseInt(page || "1", 10);

  return {
    title: currentPage === 1 ? "บทความทั้งหมด | SubTH" : `บทความทั้งหมด - หน้า ${currentPage} | SubTH`,
    description: "รวมบทความรีวิววิดีโอซับไทยทั้งหมด พร้อมเรื่องย่อและวิเคราะห์เชิงลึก",
    alternates: {
      canonical: currentPage === 1 ? `${BASE_URL}/articles` : `${BASE_URL}/articles/page/${currentPage}`,
    },
  };
}

export default async function ArticlesPagePaginated({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const searchQuery = sp.q || "";

  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
      search: searchQuery,
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles:", e);
  }

  return (
    <PublicLayout locale="th">
      {/* SEO: rel="prev/next" for pagination */}
      <PaginationHead
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/articles"
      />
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          บทความทั้งหมด
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          รวมบทความรีวิววิดีโอซับไทย พร้อมเรื่องย่อและวิเคราะห์เชิงลึก
        </p>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="ค้นหาบทความ..."
            defaultValue={searchQuery}
            basePath="/articles"
          />
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "ไม่พบบทความที่ค้นหา" : "ยังไม่มีบทความ"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/articles"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
