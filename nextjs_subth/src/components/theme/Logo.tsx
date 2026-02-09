"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const Logo = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className} />;
  }

  const src = resolvedTheme === "dark" ? "/subth_logo_dark.svg" : "/subth_logo_light.svg";

  return (
    <Image
      src={src}
      alt="SUBTH"
      width={438}
      height={213}
      className={className}
      priority
    />
  );
};
