import { Metadata } from "next";
import { notFound } from "next/navigation";
import { makerService } from "@/features/maker";
import { articleService, ArticleCard, ArticleBreadcrumb } from "@/features/article";
import { PublicLayout } from "@/components/layout";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// สร้างสีจาก string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const maker = await makerService.getBySlug(slug);
    return {
      title: `${maker.name} - บทความและผลงาน | SubTH`,
      description: `รวมบทความรีวิวผลงานจากค่าย ${maker.name} พร้อมวิเคราะห์เชิงลึกและเรื่องย่อ`,
    };
  } catch {
    return {
      title: "ไม่พบค่ายผู้ผลิต | SubTH",
    };
  }
}

export default async function MakerDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || "1", 10);

  // Fetch maker info
  let maker;
  try {
    maker = await makerService.getBySlug(slug);
  } catch {
    notFound();
  }

  // Fetch articles by this maker
  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await articleService.getByMaker(slug, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
    });
    articles = response.data;
    total = response.meta.total;
    totalPages = response.meta.totalPages;
  } catch (e) {
    console.error("Failed to fetch articles by maker:", e);
  }

  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <ArticleBreadcrumb
          items={[
            { label: "ค่าย", href: "/makers" },
            { label: maker.name },
          ]}
          locale="th"
        />

        {/* Maker Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-3xl font-bold shrink-0"
            style={{ backgroundColor: stringToColor(slug) }}
          >
            {maker.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{maker.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {maker.videoCount?.toLocaleString() || 0} วิดีโอ
              {total > 0 && ` • ${total} บทความ`}
            </p>
          </div>
        </div>

        {/* Articles Section */}
        <h2 className="text-xl font-semibold mb-4">
          บทความรีวิว
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
            ยังไม่มีบทความสำหรับค่ายนี้
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/makers/${slug}`}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
