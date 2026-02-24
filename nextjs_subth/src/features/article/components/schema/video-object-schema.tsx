import type { ArticleContent, KeyMoment } from "../../types";

interface VideoObjectSchemaProps {
  content: ArticleContent;
  videoCode: string;
}

export function VideoObjectSchema({ content, videoCode }: VideoObjectSchemaProps) {
  // Build hasPart (Clip) for key moments
  const hasPart = content.keyMoments?.map((moment: KeyMoment) => ({
    "@type": "Clip",
    name: moment.name,
    startOffset: moment.startOffset,
    endOffset: moment.endOffset,
    url: `https://subth.com/videos/${videoCode}?t=${moment.startOffset}`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: content.videoName,
    description: content.videoDescription,
    thumbnailUrl: content.thumbnailUrl,
    uploadDate: content.uploadDate,
    duration: content.duration,
    contentUrl: content.contentUrl,
    embedUrl: content.embedUrl,
    // Subscription-based access
    isAccessibleForFree: false,
    requiresSubscription: {
      "@type": "MediaSubscription",
      name: "SubTH Membership",
      "@id": "https://subth.com/membership",
    },
    // Key moments
    ...(hasPart?.length ? { hasPart } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
