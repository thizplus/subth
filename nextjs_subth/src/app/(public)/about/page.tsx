import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { Users, Shield, Sparkles, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | SubTH",
  description: "SubTH คือแพลตฟอร์มรีวิววิดีโอซับไทยคุณภาพสูง พร้อมบทวิเคราะห์เชิงลึกจากทีมผู้เชี่ยวชาญ",
};

export default function AboutPage() {
  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "เกี่ยวกับเรา" }]}
          
        />

        <h1 className="text-3xl font-bold mb-6">เกี่ยวกับ SubTH</h1>

        {/* Intro */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-muted-foreground leading-relaxed">
            SubTH คือแพลตฟอร์มรีวิววิดีโอซับไทยที่มุ่งเน้นคุณภาพเนื้อหาและประสบการณ์ผู้ใช้ที่ดีที่สุด
            เราเชื่อว่าผู้ชมชาวไทยสมควรได้รับข้อมูลที่ครบถ้วน ถูกต้อง และนำเสนออย่างมืออาชีพ
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">ทีมผู้เชี่ยวชาญ</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              บทความทุกชิ้นผ่านการคัดกรองและวิเคราะห์โดยทีม SubTH Editorial
              ที่มีประสบการณ์ในวงการมากกว่า 5 ปี
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">เนื้อหาคุณภาพ</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              รีวิวเชิงลึกพร้อมเรื่องย่อ วิเคราะห์ตัวละคร ไฮไลท์ฉากสำคัญ
              และคำแนะนำสำหรับผู้ชมแต่ละประเภท
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">อัปเดตสม่ำเสมอ</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              เพิ่มบทความใหม่ทุกวัน พร้อมติดตามผลงานล่าสุดจากค่ายและนักแสดงชั้นนำ
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">ปลอดภัยและน่าเชื่อถือ</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              ระบบรักษาความปลอดภัยมาตรฐานสูง ไม่มี Malware หรือ Adware
              ข้อมูลสมาชิกได้รับการเข้ารหัสตลอดเวลา
            </p>
          </div>
        </div>

        {/* Editorial Team */}
        <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-transparent p-6">
          <h2 className="text-xl font-semibold mb-4">SubTH Editorial Team</h2>
          <p className="text-muted-foreground mb-4">
            ทีมบรรณาธิการของเราประกอบด้วยนักเขียนและนักวิเคราะห์ที่มีความเชี่ยวชาญในการรีวิวและวิเคราะห์เนื้อหา
            ทุกบทความผ่านกระบวนการ Fact-Check เพื่อความถูกต้องของข้อมูล
          </p>
          <p className="text-sm text-muted-foreground">
            ก่อตั้งเมื่อ: 2024 | บทความที่เผยแพร่: 2,000+ เรื่อง
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
