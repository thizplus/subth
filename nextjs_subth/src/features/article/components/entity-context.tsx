interface EntityContextProps {
  code: string;
  studio?: string;
  leadCast?: string;
  genre?: string;
}

// Server Component - Entity Reinforcement Block
// ช่วย Knowledge Graph mapping + semantic depth
export function EntityContext({
  code,
  studio,
  leadCast,
  genre,
}: EntityContextProps) {
  // ต้องมีอย่างน้อย 2 entities ถึงจะแสดง
  const entities = [studio, leadCast, genre].filter(Boolean);
  if (entities.length < 2) {
    return null;
  }

  const parts: string[] = [`${code} เป็นผลงาน`];

  if (studio) {
    parts.push(`จากค่าย ${studio}`);
  }

  if (leadCast) {
    parts.push(`ที่มี ${leadCast} รับบทนำ`);
  }

  if (genre) {
    parts.push(`และอยู่ในแนว ${genre}`);
  }

  return (
    <p className="mt-2 text-sm italic text-muted-foreground">
      {parts.join(" ")}
    </p>
  );
}
