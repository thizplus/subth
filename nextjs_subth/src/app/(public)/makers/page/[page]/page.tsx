import { Metadata } from "next";
import Link from "next/link";
import { makerService } from "@/features/maker";
import { PublicLayout } from "@/components/layout";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

const ITEMS_PER_PAGE = 48;

export const metadata: Metadata = {
  title: "ค่ายผู้ผลิตทั้งหมด | SubTH",
  description: "รายชื่อค่ายผู้ผลิตทั้งหมดใน SubTH พร้อมบทความรีวิวและวิเคราะห์ผลงาน",
};

// สร้างสีจาก string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
}

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function MakersPagePaginated({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const searchQuery = sp.q || "";

  let makers: import("@/features/maker").Maker[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const response = await makerService.getList({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchQuery,
    });
    makers = response.data;
    total = response.meta.total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  } catch (e) {
    console.error("Failed to fetch makers:", e);
  }

  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-2">
          ค่ายผู้ผลิตทั้งหมด
          <span className="text-muted-foreground font-normal ml-2">
            ({total.toLocaleString()})
          </span>
        </h1>
        <p className="text-muted-foreground mb-6">
          รายชื่อค่ายผู้ผลิตทั้งหมด พร้อมบทความรีวิวและวิเคราะห์ผลงาน
        </p>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="ค้นหาค่ายผู้ผลิต..."
            defaultValue={searchQuery}
            basePath="/makers"
          />
        </div>

        {/* Makers Grid */}
        {makers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {makers.map((maker) => (
              <Link
                key={maker.id}
                href={`/makers/${maker.slug}`}
                className="flex flex-col items-center p-3 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-2"
                  style={{ backgroundColor: stringToColor(maker.slug) }}
                >
                  {maker.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-center text-sm truncate w-full">
                  {maker.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {maker.videoCount?.toLocaleString() || 0} วิดีโอ
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "ไม่พบค่ายผู้ผลิตที่ค้นหา" : "ยังไม่มีข้อมูลค่ายผู้ผลิต"}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/makers"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
