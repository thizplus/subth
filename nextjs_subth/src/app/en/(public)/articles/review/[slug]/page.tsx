import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getArticleByTypeAndSlug, ArticlePage } from "@/features/article";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticleByTypeAndSlug("review", slug, "en");

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
        locale: "en_US",
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
        canonical: `https://subth.com/en/articles/review/${slug}`,
        languages: {
          th: `https://subth.com/articles/review/${slug}`,
          en: `https://subth.com/en/articles/review/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Article Not Found | SubTH",
    };
  }
}

export default async function ReviewArticlePageEN({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticleByTypeAndSlug("review", slug, "en");
  } catch {
    notFound();
  }

  // Redirect to correct slug if language mismatch
  if (article.redirectSlug) {
    redirect(`/en/articles/review/${article.redirectSlug}`);
  }

  return <ArticlePage article={article} locale="en" />;
}
