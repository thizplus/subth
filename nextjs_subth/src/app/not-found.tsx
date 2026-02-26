"use client";

import Link from "next/link";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const handleGoBack = () => {
    // ถ้ามี history ให้ย้อนกลับ ถ้าไม่มีให้ไป home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>

        {/* Message */}
        <h2 className="text-xl font-semibold mb-2">ไม่พบหน้าที่ค้นหา</h2>
        <p className="text-muted-foreground mb-8">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles">
              <Search className="w-4 h-4 mr-2" />
              ค้นหาบทความ
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={handleGoBack}
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}
