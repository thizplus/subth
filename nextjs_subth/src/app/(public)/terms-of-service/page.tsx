import { Metadata } from "next";
import { PublicLayout } from "@/components/layout";
import { ArticleBreadcrumb } from "@/features/article";
import { ScrollText, CheckCircle, AlertTriangle, Ban, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | SubTH",
  description: "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ SubTH",
};

export default function TermsOfServicePage() {
  return (
    <PublicLayout locale="th">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "ข้อกำหนดการใช้งาน" }]}
          locale="th"
        />

        <h1 className="text-3xl font-bold mb-2">ข้อกำหนดการใช้งาน</h1>
        <p className="text-sm text-muted-foreground mb-8">
          อัปเดตล่าสุด: กุมภาพันธ์ 2026
        </p>

        {/* Key Points */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">ใช้งานส่วนตัว</h3>
              <p className="text-xs text-muted-foreground">
                เนื้อหาสำหรับการใช้งานส่วนบุคคลเท่านั้น
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Ban className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">ห้ามเผยแพร่ซ้ำ</h3>
              <p className="text-xs text-muted-foreground">
                ห้าม copy หรือเผยแพร่เนื้อหาโดยไม่ได้รับอนุญาต
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">อายุ 18+</h3>
              <p className="text-xs text-muted-foreground">
                ผู้ใช้ต้องมีอายุ 18 ปีขึ้นไป
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">ปฏิบัติตามกฎ</h3>
              <p className="text-xs text-muted-foreground">
                ผู้ใช้ต้องปฏิบัติตามกฎของชุมชน
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. การยอมรับข้อกำหนด</h2>
            <p className="text-muted-foreground text-sm">
              การเข้าใช้งานเว็บไซต์ SubTH ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ในเอกสารนี้
              หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดใช้งานเว็บไซต์ทันที
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. คุณสมบัติผู้ใช้</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>ผู้ใช้ต้องมีอายุ 18 ปีบริบูรณ์ขึ้นไป</li>
              <li>ผู้ใช้ต้องมีความสามารถทางกฎหมายในการทำสัญญา</li>
              <li>ผู้ใช้ต้องไม่ถูกระงับหรือถูกแบนจากการใช้งานก่อนหน้านี้</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. บัญชีผู้ใช้</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>คุณต้องรักษาความลับของข้อมูลบัญชี</li>
              <li>คุณต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ</li>
              <li>แจ้งเราทันทีหากพบการใช้งานที่ไม่ได้รับอนุญาต</li>
              <li>ห้ามใช้บัญชีร่วมกับผู้อื่น</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. การใช้งานที่อนุญาต</h2>
            <p className="text-muted-foreground text-sm mb-2">
              คุณสามารถใช้งานเว็บไซต์เพื่อ:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>อ่านบทความและรีวิวสำหรับการใช้งานส่วนตัว</li>
              <li>ใช้ฟีเจอร์ค้นหาและเรียกดูเนื้อหา</li>
              <li>แชร์ลิงก์ไปยังบทความ (ไม่ใช่เนื้อหา)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. ข้อห้าม</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>ห้ามคัดลอก ทำซ้ำ หรือเผยแพร่เนื้อหาโดยไม่ได้รับอนุญาต</li>
              <li>ห้ามใช้ bot, scraper หรือเครื่องมืออัตโนมัติ</li>
              <li>ห้ามพยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต</li>
              <li>ห้ามใช้งานในลักษณะที่ผิดกฎหมาย</li>
              <li>ห้ามรบกวนหรือทำให้ระบบเสียหาย</li>
              <li>ห้ามแชร์บัญชีหรือรหัสผ่าน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. ทรัพย์สินทางปัญญา</h2>
            <p className="text-muted-foreground text-sm">
              เนื้อหาทั้งหมดบนเว็บไซต์ รวมถึงบทความ รูปภาพ และกราฟิก เป็นทรัพย์สินของ SubTH
              หรือผู้ให้สิทธิ์ของเรา การใช้งานโดยไม่ได้รับอนุญาตถือเป็นการละเมิดลิขสิทธิ์
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. การชำระเงินและสมาชิก</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>ราคาและแพ็คเกจอาจเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า</li>
              <li>การชำระเงินทั้งหมดเป็นแบบไม่สามารถขอคืนได้ (non-refundable)</li>
              <li>สมาชิกจะต่ออายุอัตโนมัติ เว้นแต่จะยกเลิกก่อนวันหมดอายุ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. การยกเลิกและระงับบัญชี</h2>
            <p className="text-muted-foreground text-sm">
              เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของคุณได้ทันที หากพบว่ามีการละเมิดข้อกำหนดการใช้งาน
              โดยไม่ต้องแจ้งให้ทราบล่วงหน้าและไม่มีการคืนเงิน
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. ข้อจำกัดความรับผิดชอบ</h2>
            <p className="text-muted-foreground text-sm">
              เว็บไซต์นี้ให้บริการ "ตามสภาพ" โดยไม่มีการรับประกันใดๆ ทั้งโดยชัดแจ้งหรือโดยนัย
              เราไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้งานเว็บไซต์
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. การเปลี่ยนแปลงข้อกำหนด</h2>
            <p className="text-muted-foreground text-sm">
              เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา
              การใช้งานเว็บไซต์ต่อหลังจากมีการเปลี่ยนแปลง ถือว่าคุณยอมรับข้อกำหนดใหม่
            </p>
          </section>
        </div>

        {/* Contact */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <ScrollText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน กรุณาติดต่อ{" "}
                <a href="mailto:legal@subth.com" className="text-primary hover:underline">
                  legal@subth.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
