import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { Shield, Lock, Eye, Trash2, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | SubTH",
  description: "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของ SubTH",
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "นโยบายความเป็นส่วนตัว" }]}
          
        />

        <h1 className="text-3xl font-bold mb-2">นโยบายความเป็นส่วนตัว</h1>
        <p className="text-sm text-muted-foreground mb-8">
          อัปเดตล่าสุด: กุมภาพันธ์ 2026
        </p>

        {/* Key Points */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">เข้ารหัสข้อมูล</h3>
              <p className="text-xs text-muted-foreground">
                ข้อมูลทั้งหมดเข้ารหัส SSL/TLS
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Eye className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">ไม่ขายข้อมูล</h3>
              <p className="text-xs text-muted-foreground">
                ไม่มีการขายข้อมูลให้บุคคลที่สาม
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Trash2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">ลบข้อมูลได้</h3>
              <p className="text-xs text-muted-foreground">
                ขอลบบัญชีและข้อมูลได้ทุกเมื่อ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">แจ้งเตือนการเปลี่ยนแปลง</h3>
              <p className="text-xs text-muted-foreground">
                แจ้งล่วงหน้าเมื่อมีการเปลี่ยนนโยบาย
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>ข้อมูลบัญชี: อีเมล, ชื่อผู้ใช้, รหัสผ่าน (เข้ารหัส)</li>
              <li>ข้อมูลการใช้งาน: ประวัติการรับชม, บทความที่อ่าน</li>
              <li>ข้อมูลการชำระเงิน: ดำเนินการผ่านผู้ให้บริการภายนอกที่ปลอดภัย</li>
              <li>ข้อมูลทางเทคนิค: IP address, ประเภทเบราว์เซอร์, อุปกรณ์</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>ให้บริการและปรับปรุงประสบการณ์การใช้งาน</li>
              <li>แนะนำเนื้อหาที่ตรงกับความสนใจ</li>
              <li>ติดต่อเกี่ยวกับบัญชีและการชำระเงิน</li>
              <li>รักษาความปลอดภัยของระบบ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. การแบ่งปันข้อมูล</h2>
            <p className="text-muted-foreground text-sm">
              เราไม่ขาย ให้เช่า หรือแบ่งปันข้อมูลส่วนบุคคลของคุณกับบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด
              ข้อมูลอาจถูกแบ่งปันกับผู้ให้บริการที่จำเป็น (เช่น ระบบชำระเงิน)
              ภายใต้ข้อตกลงการรักษาความลับ
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. สิทธิ์ของคุณ</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>เข้าถึงและดาวน์โหลดข้อมูลของคุณ</li>
              <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
              <li>ขอลบบัญชีและข้อมูลทั้งหมด</li>
              <li>ยกเลิกการรับอีเมลโปรโมชัน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. ความปลอดภัย</h2>
            <p className="text-muted-foreground text-sm">
              เราใช้มาตรการรักษาความปลอดภัยมาตรฐานอุตสาหกรรม รวมถึงการเข้ารหัส SSL/TLS,
              การยืนยันตัวตนสองขั้นตอน (2FA) และการตรวจสอบความปลอดภัยอย่างสม่ำเสมอ
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. คุกกี้</h2>
            <p className="text-muted-foreground text-sm">
              เราใช้คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ เช่น การเข้าสู่ระบบและการตั้งค่าธีม
              คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานบางฟีเจอร์
            </p>
          </section>
        </div>

        {/* Warrant Canary */}
        <div className="mt-8 rounded-xl border border-success/20 bg-success/5 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-success mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2 text-success">
                Warrant Canary
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                นับตั้งแต่ก่อตั้ง SubTH ไม่เคยได้รับคำสั่งจากศาลหรือหน่วยงานใดๆ
                ให้เปิดเผยข้อมูลผู้ใช้ หรือติดตั้งระบบติดตามผู้ใช้ (Backdoor)
              </p>
              <p className="text-xs text-muted-foreground">
                อัปเดตล่าสุด: กุมภาพันธ์ 2026
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อ{" "}
            <a href="mailto:privacy@subth.com" className="text-primary hover:underline">
              privacy@subth.com
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
