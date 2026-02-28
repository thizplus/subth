import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getArticleByTypeAndSlug, ArticlePage } from "@/features/article";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticleByTypeAndSlug("review", slug, "th");

    return {
      title: article.metaTitle,
      description: article.metaDescription,
      openGraph: {
        type: "article",
        title: article.metaTitle,
        description: article.metaDescription,
        images: [
          {
            url: article.content.thumbnailUrl,
            width: 1280,
            height: 720,
            alt: article.content.titleBalanced,
          },
        ],
        siteName: "SubTH",
        locale: "th_TH",
        publishedTime: article.publishedAt,
        modifiedTime: article.content.updatedAt,
        authors: ["SubTH Editorial"],
      },
      twitter: {
        card: "summary_large_image",
        title: article.metaTitle,
        description: article.metaDescription,
        images: [article.content.thumbnailUrl],
      },
      alternates: {
        canonical: `https://subth.com/articles/review/${slug}`,
        languages: {
          th: `https://subth.com/articles/review/${slug}`,
          en: `https://subth.com/en/articles/review/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "บทความไม่พบ | SubTH",
    };
  }
}

export default async function ReviewArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticleByTypeAndSlug("review", slug, "th");
  } catch {
    notFound();
  }

  // Redirect ไปยัง slug ที่ถูกต้องถ้าภาษาไม่ตรง
  if (article.redirectSlug) {
    redirect(`/articles/review/${article.redirectSlug}`);
  }

  return <ArticlePage article={article} locale="th" />;
}
