/**
 * Format timestamp seconds to MM:SS or HH:MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parse ISO 8601 duration to seconds
 * e.g., "PT2H2M11S" -> 7331
 */
export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format ISO 8601 duration to readable string
 * e.g., "PT2H2M11S" -> "2 ชั่วโมง 2 นาที"
 */
export function formatDuration(isoDuration: string): string {
  const totalSeconds = parseDuration(isoDuration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`;
  } else if (hours > 0) {
    return `${hours} ชั่วโมง`;
  } else if (minutes > 0) {
    return `${minutes} นาที`;
  }
  return `${totalSeconds} วินาที`;
}
