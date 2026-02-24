import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { Mail, MessageCircle, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "ติดต่อเรา | SubTH",
  description: "ช่องทางติดต่อทีม SubTH สำหรับสอบถามข้อมูล แจ้งปัญหา หรือเสนอแนะ",
};

export default function ContactPage() {
  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "ติดต่อเรา" }]}
          locale="th"
        />

        <h1 className="text-3xl font-bold mb-6">ติดต่อเรา</h1>

        <p className="text-lg text-muted-foreground mb-8">
          มีคำถาม ข้อเสนอแนะ หรือต้องการแจ้งปัญหา? ทีม SubTH ยินดีรับฟังและช่วยเหลือคุณ
        </p>

        {/* Contact Methods */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">อีเมล</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              สำหรับเรื่องทั่วไปและการสมัครสมาชิก
            </p>
            <a
              href="mailto:support@subth.com"
              className="text-primary hover:underline font-medium"
            >
              support@subth.com
            </a>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Community Chat</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              พูดคุยกับสมาชิกคนอื่นและทีมงาน
            </p>
            <p className="text-sm text-muted-foreground">
              เข้าสู่ระบบเพื่อใช้งาน Chat
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="rounded-xl border bg-muted/30 p-6 mb-8">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">ระยะเวลาตอบกลับ</h3>
              <p className="text-sm text-muted-foreground">
                เราพยายามตอบกลับทุกข้อความภายใน 24-48 ชั่วโมง (วันทำการ)
                สำหรับปัญหาเร่งด่วนเกี่ยวกับการชำระเงิน จะได้รับการตอบกลับภายใน 12 ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        {/* Report Issues */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">แจ้งปัญหาเนื้อหา</h3>
              <p className="text-sm text-muted-foreground mb-2">
                หากพบเนื้อหาที่ไม่เหมาะสม ข้อมูลผิดพลาด หรือปัญหาทางเทคนิค
                กรุณาแจ้งให้เราทราบเพื่อดำเนินการแก้ไข
              </p>
              <a
                href="mailto:report@subth.com"
                className="text-sm text-destructive hover:underline font-medium"
              >
                report@subth.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
