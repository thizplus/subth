import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout";
import { ArticleBreadcrumb } from "@/features/article";
import { User, Calendar, FileText, Award, ExternalLink } from "lucide-react";

// Author data (ในอนาคตอาจดึงจาก API)
const authors: Record<string, {
  name: string;
  slug: string;
  role: string;
  bio: string;
  expertise: string[];
  joinedDate: string;
  articleCount: number;
  avatar?: string;
}> = {
  "subth-editorial": {
    name: "SubTH Editorial",
    slug: "subth-editorial",
    role: "ทีมบรรณาธิการ",
    bio: "ทีมบรรณาธิการของ SubTH ประกอบด้วยนักเขียนและนักวิเคราะห์ที่มีประสบการณ์ในการรีวิวและวิเคราะห์เนื้อหามากกว่า 5 ปี ทุกบทความผ่านกระบวนการ Fact-Check และตรวจสอบคุณภาพก่อนเผยแพร่ เพื่อให้มั่นใจว่าผู้อ่านจะได้รับข้อมูลที่ถูกต้องและครบถ้วน",
    expertise: ["รีวิววิดีโอ", "วิเคราะห์เนื้อหา", "ซับไทย", "ข้อมูลนักแสดง"],
    joinedDate: "2024-01-01",
    articleCount: 2000,
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = authors[slug];

  if (!author) {
    return { title: "ไม่พบผู้เขียน | SubTH" };
  }

  return {
    title: `${author.name} - ผู้เขียน | SubTH`,
    description: author.bio.slice(0, 160),
  };
}

export async function generateStaticParams() {
  return Object.keys(authors).map((slug) => ({ slug }));
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = authors[slug];

  if (!author) {
    notFound();
  }

  // Author Schema
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://subth.com/author/${author.slug}`,
    description: author.bio,
    jobTitle: author.role,
    worksFor: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
    knowsAbout: author.expertise,
  };

  return (
    <PublicLayout locale="th">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: author.name }]}
          locale="th"
        />

        {/* Author Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
            <p className="text-muted-foreground mb-3">{author.role}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>เข้าร่วมเมื่อ {new Date(author.joinedDate).toLocaleDateString("th-TH", { year: "numeric", month: "long" })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>{author.articleCount.toLocaleString()} บทความ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-xl border bg-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">เกี่ยวกับ</h2>
          <p className="text-muted-foreground leading-relaxed">
            {author.bio}
          </p>
        </div>

        {/* Expertise */}
        <div className="rounded-xl border bg-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            ความเชี่ยวชาญ
          </h2>
          <div className="flex flex-wrap gap-2">
            {author.expertise.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Articles Link */}
        <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-transparent p-6">
          <h2 className="text-lg font-semibold mb-3">บทความล่าสุด</h2>
          <p className="text-muted-foreground mb-4">
            ดูบทความทั้งหมดที่เขียนโดย {author.name}
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            ดูบทความทั้งหมด
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
