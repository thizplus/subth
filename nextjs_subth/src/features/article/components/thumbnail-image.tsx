import Image from "next/image";

interface ThumbnailImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

// Server Component - จะอยู่ใน initial HTML เสมอ
export function ThumbnailImage({ src, alt, priority = true }: ThumbnailImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      fetchPriority="high"
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
    />
  );
}
