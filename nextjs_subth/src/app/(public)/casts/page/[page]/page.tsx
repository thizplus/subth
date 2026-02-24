import { Metadata } from "next";
import Link from "next/link";
import { castService } from "@/features/cast";
import { PublicLayout } from "@/components/layout";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 48;

export const metadata: Metadata = {
  title: "นักแสดงทั้งหมด | SubTH",
  description: "รายชื่อนักแสดงทั้งหมดใน SubTH พร้อมบทความรีวิวและประวัติ",
};

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
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function CastsPagePaginated({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const searchQuery = sp.q || "";

  let casts: import("@/features/cast").Cast[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await castService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      lang: "th",
      search: searchQuery,
    });
    casts = response.data;
    total = response.meta.total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch casts:", e);
  }

  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          นักแสดงทั้งหมด
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          รายชื่อนักแสดงทั้งหมด พร้อมบทความรีวิวและวิเคราะห์ผลงาน
        </p>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="ค้นหานักแสดง..."
            defaultValue={searchQuery}
            basePath="/casts"
          />
        </div>

        {/* Casts Grid */}
        {casts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {casts.map((cast) => (
              <Link
                key={cast.id}
                href={`/casts/${cast.slug}`}
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
                <p className="text-xs text-muted-foreground text-center truncate w-full">
                  {slugToName(cast.slug)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cast.videoCount?.toLocaleString() || 0} วิดีโอ
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "ไม่พบนักแสดงที่ค้นหา" : "ยังไม่มีข้อมูลนักแสดง"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/casts"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
