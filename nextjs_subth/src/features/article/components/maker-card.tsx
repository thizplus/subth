import Link from "next/link";
import { Building2 } from "lucide-react";
import type { MakerInfo } from "../types";

interface MakerCardProps {
  maker?: MakerInfo;
}

export function MakerCard({ maker }: MakerCardProps) {
  if (!maker) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Building2 className="h-4 w-4" />
        ค่าย
      </p>

      <Link
        href={maker.profileUrl}
        className="group inline-flex items-center gap-2 rounded-full border bg-background py-1.5 pl-1.5 pr-4 transition-all hover:border-primary/50 hover:bg-primary/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium group-hover:text-primary">
          {maker.name}
        </span>
      </Link>
    </div>
  );
}
